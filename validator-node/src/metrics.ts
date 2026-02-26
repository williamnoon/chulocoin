// Prometheus metrics collector

import { register, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsCollector {
  private readonly signalsReceived: Counter;
  private readonly validationsTotal: Counter;
  private readonly votesApprove: Counter;
  private readonly votesReject: Counter;
  private readonly validationErrors: Counter;
  private readonly healthCheckFailures: Counter;
  private readonly backtestDuration: Histogram;
  private readonly validationDuration: Histogram;
  private readonly activeValidations: Gauge;

  constructor() {
    // Counter for total signals received
    this.signalsReceived = new Counter({
      name: 'chulobots_signals_received_total',
      help: 'Total number of signals received via WebSocket',
    });

    // Counter for total validations completed
    this.validationsTotal = new Counter({
      name: 'chulobots_validations_total',
      help: 'Total number of validations completed',
    });

    // Counter for approve votes
    this.votesApprove = new Counter({
      name: 'chulobots_votes_approve_total',
      help: 'Total number of APPROVE votes submitted',
    });

    // Counter for reject votes
    this.votesReject = new Counter({
      name: 'chulobots_votes_reject_total',
      help: 'Total number of REJECT votes submitted',
    });

    // Counter for validation errors
    this.validationErrors = new Counter({
      name: 'chulobots_validation_errors_total',
      help: 'Total number of validation errors',
    });

    // Counter for health check failures
    this.healthCheckFailures = new Counter({
      name: 'chulobots_health_check_failures_total',
      help: 'Total number of health check failures',
    });

    // Histogram for backtest duration
    this.backtestDuration = new Histogram({
      name: 'chulobots_backtest_duration_seconds',
      help: 'Duration of backtest execution',
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    });

    // Histogram for total validation duration
    this.validationDuration = new Histogram({
      name: 'chulobots_validation_duration_seconds',
      help: 'Total duration of validation (backtest + vote)',
      buckets: [0.5, 1, 2, 5, 10, 30, 60, 120],
    });

    // Gauge for active validations
    this.activeValidations = new Gauge({
      name: 'chulobots_active_validations',
      help: 'Number of validations currently in progress',
    });
  }

  incrementCounter(name: string): void {
    switch (name) {
      case 'signals_received_total':
        this.signalsReceived.inc();
        break;
      case 'validations_total':
        this.validationsTotal.inc();
        break;
      case 'votes_approve_total':
        this.votesApprove.inc();
        break;
      case 'votes_reject_total':
        this.votesReject.inc();
        break;
      case 'validation_errors_total':
        this.validationErrors.inc();
        break;
      case 'health_check_failures_total':
        this.healthCheckFailures.inc();
        break;
    }
  }

  recordHistogram(name: string, value: number): void {
    switch (name) {
      case 'backtest_duration_seconds':
        this.backtestDuration.observe(value);
        break;
      case 'validation_duration_seconds':
        this.validationDuration.observe(value);
        break;
    }
  }

  setGauge(name: string, value: number): void {
    switch (name) {
      case 'active_validations':
        this.activeValidations.set(value);
        break;
    }
  }

  incGauge(name: string): void {
    if (name === 'active_validations') {
      this.activeValidations.inc();
    }
  }

  decGauge(name: string): void {
    if (name === 'active_validations') {
      this.activeValidations.dec();
    }
  }

  cleanup(): void {
    // Reset gauges
    this.activeValidations.set(0);
  }

  getRegistry() {
    return register;
  }
}
