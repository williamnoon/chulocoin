use anyhow::Result;
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph},
    Terminal,
};
use std::io;
use tracing_subscriber;

use chulobots_cli::{
    blockchain::BlockchainClient,
    mining::MiningEngine,
    ui::render_app,
};

#[derive(Debug)]
pub struct App {
    pub mining_engine: MiningEngine,
    pub blockchain_client: BlockchainClient,
    pub should_quit: bool,
}

impl App {
    pub fn new() -> Self {
        Self {
            mining_engine: MiningEngine::new(),
            blockchain_client: BlockchainClient::new(),
            should_quit: false,
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

    // Setup terminal
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // Create app state
    let mut app = App::new();

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
        terminal.draw(|f| render_app(f, app))?;

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
                        // Refresh balance
                        app.blockchain_client.refresh_balance();
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
