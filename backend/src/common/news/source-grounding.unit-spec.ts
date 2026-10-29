import { assessNewsSourceGrounding } from './source-grounding';

describe('assessNewsSourceGrounding', () => {
  it('rejects a Catalonia housing draft backed by a tourism article', () => {
    const result = assessNewsSourceGrounding({
      sourceTitle: '12 tesoros romanos poco conocidos de España',
      sourceSnippet: 'Teatro de Acinipo y cisternas de Monturque.',
      sourceContent: 'Ruta turística por vestigios romanos en Andalucía y otras regiones.',
      draftTitle: 'Ayudas para vivienda en Catalunya',
      draftSummary: 'Nuevas ayudas de vivienda en Catalunya para alquiler.',
      draftBody: 'La Generalitat anuncia ayudas en Catalunya.',
      draftMunicipality: 'Catalunya',
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining(['catalonia_not_in_source', 'title_overlap_missing']),
    );
  });

  it('rejects Catalunya framing when the source is Castilla y León', () => {
    const result = assessNewsSourceGrounding({
      sourceTitle: 'Vox afea a la vicepresidenta de Castilla y León',
      sourceSnippet: 'Prioridad nacional en Castilla y León frente a 2024.',
      sourceContent:
        'El debate político en Castilla y León compara cifras con 2024 sin referirse a otras comunidades.',
      draftTitle: 'Incremento del 88,8 % en Catalunya frente al año anterior',
      draftSummary: 'El incremento del 88,8 % en Catalunya supera el año anterior.',
      draftBody: 'Catalunya registra un aumento del 88,8 % respecto al año anterior.',
      draftMunicipality: 'Catalunya',
    });

    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'source_outside_catalonia',
        'territory_mismatch',
        'unsupported_percent:88.8',
      ]),
    );
  });

  it('accepts a draft grounded in a Catalonia housing source', () => {
    const result = assessNewsSourceGrounding({
      sourceTitle: 'La Generalitat amplia ayudas al alquiler en Catalunya',
      sourceSnippet: 'Nuevas prestaciones de habitatge para 2026 en Barcelona.',
      sourceContent:
        'Habitatge anuncia un incremento del 12 % en ayudas al alquiler en Catalunya respecto a 2025.',
      draftTitle: 'Ayudas al alquiler en Catalunya: suben un 12 %',
      draftSummary: 'Habitatge amplia las ayudas al alquiler en Catalunya un 12 %.',
      draftBody:
        'La Generalitat confirma un incremento del 12 % en las ayudas al alquiler en Catalunya respecto a 2025.',
      draftMunicipality: 'Catalunya',
    });

    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });
});
