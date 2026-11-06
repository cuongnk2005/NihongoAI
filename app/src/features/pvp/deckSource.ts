import type { DeckNode } from '../decks/pages/DecksPage';

export function deckCards(deck: DeckNode): { word: string; reading: string; meaningVi: string }[] {
  return [...(deck.cards || []), ...(deck.children || []).flatMap(child => deckCards(child))]
    .filter(card => card.word?.trim() && card.meaningVi?.trim() && !('cardType' in card && card.cardType === 'cloze'))
    .map(card => ({ word: card.word.trim(), meaningVi: card.meaningVi!.trim(),
      reading: (card.reading || '').split(/\s*[•|]\s*|\s*[(（]/)[0].trim() }));
}
export function deckChoices(decks: DeckNode[], prefix = ''): { id: string; label: string; cards: ReturnType<typeof deckCards> }[] {
  return decks.flatMap(deck => {
    const label = prefix ? `${prefix} / ${deck.name}` : deck.name;
    return [{ id: deck.id, label, cards: deckCards(deck) }, ...deckChoices(deck.children || [], label)];
  });
}
