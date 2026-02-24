use anyhow::{Context, Result};
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::io;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing_subscriber;

use chulobots_cli::{blockchain::BlockchainClient, mining::MiningEngine, ui::render_app, Config};

#[derive(Debug)]
pub struct App {
    pub mining_engine: MiningEngine,
    pub blockchain_client: Arc<Mutex<BlockchainClient>>,
    pub should_quit: bool,
    pub status_message: Option<String>,
}

impl App {
    pub fn new(blockchain_client: Arc<Mutex<BlockchainClient>>) -> Self {
        Self {
            mining_engine: MiningEngine::new(),
            blockchain_client,
            should_quit: false,
            status_message: None,
        }
    }

    pub fn on_tick(&mut self) {
        // Update mining stats
        self.mining_engine.update();
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load configuration
    let config = match Config::load() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to load config: {}", e);
            eprintln!("\nPlease create a config file at:");
            if let Ok(path) = Config::default_path() {
                eprintln!("  {}", path.display());
            }
            eprintln!("\nYou can copy config.example.toml as a starting point.");
            std::process::exit(1);
        }
    };

    // Initialize blockchain client
    let blockchain_client = Arc::new(Mutex::new(BlockchainClient::new()));

    // Connect to blockchain
    {
        let mut client = blockchain_client.lock().await;
        let private_key = config
            .get_private_key()
            .context("Failed to get private key")?;

        match client
            .connect(
                &private_key,
                &config.network.rpc_url,
                config.network.chain_id,
                &config.contracts.chulo_address,
                &config.contracts.signal_registry_address,
            )
            .await
        {
            Ok(_) => {
                tracing::info!("Connected to blockchain successfully");
            }
            Err(e) => {
                eprintln!("Failed to connect to blockchain: {}", e);
                eprintln!("\nPlease check your configuration and try again.");
                std::process::exit(1);
            }
        }
    }

    // Start balance polling task
    let balance_client = blockchain_client.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            let mut client = balance_client.lock().await;
            if let Err(e) = client.fetch_balance().await {
                tracing::warn!("Failed to fetch balance: {}", e);
            }
        }
    });

    // Setup terminal
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // Create app state
    let mut app = App::new(blockchain_client.clone());

    // Run app
    let res = run_app(&mut terminal, &mut app).await;

    // Restore terminal
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    if let Err(err) = res {
        println!("Error: {:?}", err);
    }

    Ok(())
}

async fn run_app<B: ratatui::backend::Backend>(
    terminal: &mut Terminal<B>,
    app: &mut App,
) -> Result<()> {
    loop {
        // Render UI
        let client = app.blockchain_client.lock().await;
        terminal.draw(|f| render_app(f, app, &client))?;
        drop(client); // Release lock

        // Handle input
        if event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                match key.code {
                    KeyCode::Char('q') | KeyCode::Char('Q') => {
                        app.should_quit = true;
                    }
                    KeyCode::Char('s') | KeyCode::Char('S') => {
                        // Toggle mining
                        app.mining_engine.toggle();
                    }
                    KeyCode::Char('r') | KeyCode::Char('R') => {
                        // Refresh balance manually
                        let mut client = app.blockchain_client.lock().await;
                        if let Err(e) = client.fetch_balance().await {
                            app.status_message = Some(format!("Error: {}", e));
                        } else {
                            app.status_message = Some("Balance refreshed".to_string());
                        }
                    }
                    _ => {}
                }
            }
        }

        // Update state
        app.on_tick();

        if app.should_quit {
            break;
        }
    }

    Ok(())
}
