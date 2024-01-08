import { useQueries } from '@tanstack/react-query';
import { fetchDBGameData } from './spil';
import TurneringKort from '@/components/Cards/TurneringKort';
import { useAtom } from 'jotai';
import {
  addTurneringAtom,
  editTurneringAtom,
  showAddTurneringAtom,
  showEditTurneringAtom,
} from '@/states/store';
import { EditTurneringSheet } from '../../components/AddChangeTurnering/EditTurneringSheet';
import { fetchDBTurneringData } from './turnering';

import { AddTurneringSheet } from '../../components/AddChangeTurnering/AddTurneringSheet';
import { fetchSponsors, fileObject } from './test';

export const TurneringsListe = () => {
  const [editTurnering, setEditTurnering] = useAtom(editTurneringAtom);
  const [addTurnering, setAddTurnering] = useAtom(addTurneringAtom);
  const [showAddTurnering, setShowAddTurnering] = useAtom(showAddTurneringAtom);
  const [showEditTurnering, setShowEditTurnering] = useAtom(showEditTurneringAtom);

  const results = useQueries({
    queries: [
      {
        queryKey: ['hydrate-turneringDBData'],
        queryFn: () => fetchDBTurneringData(),
      },
      {
        queryKey: ['hydrate-gameDBData'],
        queryFn: () => fetchDBGameData(),
      },
      { queryKey: ['hydrate-sponsorDBData'], queryFn: () => fetchSponsors() },
    ],
  });
  const { data: tData, isLoading: tDataIsLoading } = results[0];

  const { data: gData, isLoading: gDataIsLoading } = results[1];
  const { data: sponsorData, isLoading: sponsorDataIsLoading } = results[2];

  return (
    <div className='grid gap-4 lg:grid-cols-3 md:grid-cols-2'>
      {tData &&
        tData.map(turnering => (
          <div
            key={turnering.id}
            className='cursor-pointer'
            onClick={() => {
              console.log(turnering);

              setEditTurnering(turnering);
              setShowEditTurnering(true);
            }}
          >
            <TurneringKort datas={turnering} />
          </div>
        ))}

      <EditTurneringSheet {...editTurnering} />
      <AddTurneringSheet
        turnering={addTurnering}
        gData={gData}
        sponsorData={sponsorData?.props?.sponsors1 as fileObject[] | []}
      />
    </div>
  );
};
