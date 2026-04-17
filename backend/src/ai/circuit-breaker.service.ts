import { Injectable } from '@nestjs/common';
import { AiProvider } from './ai.types';

type State = 'closed' | 'open' | 'half-open';

type BreakerState = {
  state: State;
  failures: number;
  openedAt?: number;
};

@Injectable()
export class CircuitBreakerService {
  private readonly states = new Map<AiProvider, BreakerState>();

  private readonly failureThreshold = Number(
    process.env.AI_CIRCUIT_FAILURE_THRESHOLD ?? 4,
  );
  private readonly cooldownMs = Number(
    process.env.AI_CIRCUIT_COOLDOWN_MS ?? 45000,
  );

  canRequest(provider: AiProvider): boolean {
    const current = this.getState(provider);

    if (current.state === 'closed') {
      return true;
    }

    if (current.state === 'open') {
      const now = Date.now();
      if (!current.openedAt || now - current.openedAt >= this.cooldownMs) {
        this.states.set(provider, {
          ...current,
          state: 'half-open',
        });
        return true;
      }

      return false;
    }

    return true;
  }

  onSuccess(provider: AiProvider): void {
    this.states.set(provider, {
      state: 'closed',
      failures: 0,
    });
  }

  onFailure(provider: AiProvider): void {
    const current = this.getState(provider);
    const failures = current.failures + 1;

    if (failures >= this.failureThreshold) {
      this.states.set(provider, {
        state: 'open',
        failures,
        openedAt: Date.now(),
      });
      return;
    }

    this.states.set(provider, {
      ...current,
      failures,
    });
  }

  private getState(provider: AiProvider): BreakerState {
    return (
      this.states.get(provider) ?? {
        state: 'closed',
        failures: 0,
      }
    );
  }
}
