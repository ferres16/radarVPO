import { describe, expect, it } from 'vitest';
import { shortenAlertTitle } from './alert-title';

describe('shortenAlertTitle', () => {
  it('strips the full Catalan boilerplate sentence', () => {
    const title =
      "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès. En el termini de 60 dies es publicarà l'anunci amb els detalls i on es recollirà el procediment d'adjudicació.";
    expect(shortenAlertTitle(title)).toBe(
      "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès",
    );
  });

  it('strips truncated boilerplate that ends mid-word', () => {
    const title =
      "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès. En el termini de 60 dies es publicarà l'anunci amb els detalls i on es recollirà el procediment d'adjud";
    expect(shortenAlertTitle(title)).toBe(
      "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per LANDCOMPANY 2020, SLU a Vilafranca del Penedès",
    );
  });
});
