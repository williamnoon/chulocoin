use ratatui::{
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
    Frame,
};

use crate::App;
use crate::mining::MiningStatus;

pub fn render_app(f: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .margin(2)
        .constraints(
            [
                Constraint::Length(3), // Header
                Constraint::Length(5), // Status
                Constraint::Length(8), // Wallet Info
                Constraint::Length(10), // Mining Stats
                Constraint::Min(0),    // Spacer
                Constraint::Length(3), // Controls
            ]
            .as_ref(),
        )
        .split(f.area());

    render_header(f, chunks[0]);
    render_status(f, chunks[1], app);
    render_wallet_info(f, chunks[2], app);
    render_mining_stats(f, chunks[3], app);
    render_controls(f, chunks[5]);
}

fn render_header(f: &mut Frame, area: Rect) {
    let header = Paragraph::new(vec![Line::from(vec![
        Span::styled(
            "ChuloBots CLI ",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            "v0.1.0",
            Style::default().fg(Color::Gray),
        ),
    ])])
    .alignment(Alignment::Center)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan)),
    );

    f.render_widget(header, area);
}

fn render_status(f: &mut Frame, area: Rect, app: &App) {
    let (status_text, status_color, indicator) = match app.mining_engine.status() {
        MiningStatus::Active => ("MINING ACTIVE", Color::Green, "●"),
        MiningStatus::Paused => ("PAUSED", Color::Yellow, "○"),
    };

    let uptime = app.mining_engine.stats().uptime;
    let uptime_text = format!(
        "{:02}:{:02}:{:02}",
        uptime.as_secs() / 3600,
        (uptime.as_secs() % 3600) / 60,
        uptime.as_secs() % 60
    );

    let status = Paragraph::new(vec![
        Line::from(""),
        Line::from(vec![
            Span::styled(
                format!("{} ", indicator),
                Style::default()
                    .fg(status_color)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                status_text,
                Style::default()
                    .fg(status_color)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw("  |  Uptime: "),
            Span::styled(
                uptime_text,
                Style::default().fg(Color::White),
            ),
        ]),
    ])
    .alignment(Alignment::Center)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .title("Status")
            .border_style(Style::default().fg(Color::White)),
    );

    f.render_widget(status, area);
}

fn render_wallet_info(f: &mut Frame, area: Rect, app: &App) {
    let wallet = app.blockchain_client.wallet();

    let tier_color = match wallet.tier_level {
        4 => Color::Magenta,
        3 => Color::Blue,
        2 => Color::Cyan,
        1 => Color::Green,
        _ => Color::Gray,
    };

    let wallet_info = Paragraph::new(vec![
        Line::from(""),
        Line::from(vec![
            Span::raw("Address: "),
            Span::styled(
                &wallet.address,
                Style::default().fg(Color::Yellow),
            ),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::raw("CHULO Balance: "),
            Span::styled(
                format!("{:.2}", wallet.chulo_balance),
                Style::default()
                    .fg(Color::Green)
                    .add_modifier(Modifier::BOLD),
            ),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::raw("Tier: "),
            Span::styled(
                &wallet.tier,
                Style::default()
                    .fg(tier_color)
                    .add_modifier(Modifier::BOLD),
            ),
        ]),
    ])
    .block(
        Block::default()
            .borders(Borders::ALL)
            .title("Wallet")
            .border_style(Style::default().fg(Color::White)),
    );

    f.render_widget(wallet_info, area);
}

fn render_mining_stats(f: &mut Frame, area: Rect, app: &App) {
    let stats = app.mining_engine.stats();

    let validation_rate = if stats.signals_processed > 0 {
        (stats.signals_validated as f64 / stats.signals_processed as f64) * 100.0
    } else {
        0.0
    };

    let mining_stats = Paragraph::new(vec![
        Line::from(""),
        Line::from(vec![
            Span::raw("Signals Processed: "),
            Span::styled(
                format!("{}", stats.signals_processed),
                Style::default().fg(Color::Cyan),
            ),
        ]),
        Line::from(vec![
            Span::raw("Validated: "),
            Span::styled(
                format!("{}", stats.signals_validated),
                Style::default().fg(Color::Green),
            ),
            Span::raw("  |  Rejected: "),
            Span::styled(
                format!("{}", stats.signals_rejected),
                Style::default().fg(Color::Red),
            ),
            Span::raw("  |  Rate: "),
            Span::styled(
                format!("{:.1}%", validation_rate),
                Style::default().fg(Color::Yellow),
            ),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::raw("Earnings Today: "),
            Span::styled(
                format!("{:.2} CHULO", stats.earnings_today),
                Style::default()
                    .fg(Color::Green)
                    .add_modifier(Modifier::BOLD),
            ),
        ]),
        Line::from(vec![
            Span::raw("Total Earnings: "),
            Span::styled(
                format!("{:.2} CHULO", stats.earnings_total),
                Style::default()
                    .fg(Color::Green)
                    .add_modifier(Modifier::BOLD),
            ),
        ]),
    ])
    .block(
        Block::default()
            .borders(Borders::ALL)
            .title("Mining Statistics")
            .border_style(Style::default().fg(Color::White)),
    );

    f.render_widget(mining_stats, area);
}

fn render_controls(f: &mut Frame, area: Rect) {
    let controls = Paragraph::new(Line::from(vec![
        Span::styled(
            "[S]",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ),
        Span::raw(" Start/Stop  "),
        Span::styled(
            "[R]",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ),
        Span::raw(" Refresh  "),
        Span::styled(
            "[Q]",
            Style::default()
                .fg(Color::Red)
                .add_modifier(Modifier::BOLD),
        ),
        Span::raw(" Quit"),
    ]))
    .alignment(Alignment::Center)
    .block(
        Block::default()
            .borders(Borders::ALL)
            .title("Controls")
            .border_style(Style::default().fg(Color::Gray)),
    );

    f.render_widget(controls, area);
}
