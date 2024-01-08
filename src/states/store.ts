import { Game, GameRoot } from '@/Types/gamelist';
import { Sponsor } from '@/pages/admin/test';
import { Turnering } from '@/pages/events/turneringer';
import { atom } from 'jotai';

export const showAddGameAtom = atom<boolean>(false);
export const showEditGameAtom = atom<boolean>(false);
export const gameIdAtom = atom<number>(0);
export const addNewGameAtom = atom<Game>({} as Game);
export const editGameAtom = atom<Game>({} as Game);
export const bookingCompleteAtom = atom<boolean>(false);

export const submitFormAtom = atom<boolean>(false);

export const deleteEntry = atom<number | null>(null);
export const openErrorAtom = atom<boolean>(false);

export const editTurneringAtom = atom<Turnering>({} as Turnering);
export const addTurneringAtom = atom<Turnering>({} as Turnering);

export const showAddTurneringAtom = atom<boolean>(false);
export const showEditTurneringAtom = atom<boolean>(false);
export const sponsorsAtom = atom<Sponsor[]>([]);
