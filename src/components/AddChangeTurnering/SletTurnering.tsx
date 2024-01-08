import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { editTurneringAtom, showEditTurneringAtom } from '../../states/store';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '../../../utils/supabaseClient';

export const SletTurnering = () => {
  const [editTurnering, setEditTurnering] = useAtom(editTurneringAtom);
  const [showEditTurnering, setShowEditTurnering] = useAtom(showEditTurneringAtom);
  const queryClient = useQueryClient();
  const handleDeleteTurnering = async () => {
    const { data, error } = await supabase.from('turneringer').delete().eq('id', editTurnering.id);
    queryClient.invalidateQueries({ queryKey: ['hydrate-turneringDBData'] });
    setShowEditTurnering(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          className='max uppercase font-bold hover:bg-transparent border-2 border-accentCol transition-colors duration-300'
          size='sm'
          type='button'
        >
          Slet
        </Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent className='border-accentCol max-w-[500px] '>
          <AlertDialogHeader>
            <h4>Er du sikker?</h4>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <p>
              Denne handling kan ikke fortrydes. Dette vil permanent slette Turneringen og vil selv
              skulle tilføje det igen.
            </p>
          </AlertDialogDescription>
          <div className='flex justify-end gap-3'>
            <AlertDialogAction asChild>
              <Button
                className='w-fit uppercase font-bold hover:bg-transparent border-2 border-accentCol transition-colors duration-300'
                size='sm'
                onClick={() => handleDeleteTurnering()}
              >
                Slet
              </Button>
            </AlertDialogAction>
            <AlertDialogCancel asChild>
              <Button
                className='w-fit uppercase font-bold hover:bg-transparent border-2 border-accentCol transition-colors duration-300'
                size='sm'
              >
                Fortryd
              </Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
