import { LayoutAdmin } from '@/Layout_Admin';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import TurneringCards from '@/components/Cards/TurneringCards';
import { showAddTurneringAtom } from '@/states/store';
import { Skeleton } from '@/components/ui/skeleton';
import TurneringsListe from '../../components/AddChangeTurnering/TurneringsListe';
import { Button } from '@/components/Button/Button';
import { useAtom } from 'jotai';
import { PlusCircle } from 'lucide-react';

export const fetchDBTurneringData = async () => {
  let { data, error } = await supabase.from('turneringer').select('*');
  return data;
};

export default function Turneringer() {
  // COMMENT OUT FROM HERE TO DISABLE LOGIN GUARD
  const router = useRouter();
  const [showAddTurnering, setShowAddTurnering] = useAtom(showAddTurneringAtom);

  const queryClient = new QueryClient();

  useEffect(() => {
    getSession();
  }, []);

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (data.session === null) {
      router.push('/login');
    }
  }

  // COMMENT OUT TO HERE TO DISABLE LOGIN GUARD
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <LayoutAdmin>
          <main>
            <section>
              <div className='flex justify-center'>
                <div className='spacer w-full'>
                  <h1 className='mt-20'>Admin turneringer</h1>
                  <p>
                    Her kan du administrere hvilke turneringer, som vises på jeres site. Det er
                    muligt at tilføje, redigere og fjerne turneringer.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <div className='flex justify-center'>
                <div className='spacer w-full'>
                  <Button
                    onClick={() => setShowAddTurnering(true)}
                    size='default'
                    className='justify-between w-fit uppercase font-bold hover:bg-transparent hover:border-accentCol rounded border-2 border-transparent transition-colors duration-300 md:mr-auto mb-3'
                  >
                    Tilføj turnering <PlusCircle className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                  <TurneringsListe />
                </div>
              </div>
            </section>
          </main>
        </LayoutAdmin>
      </QueryClientProvider>
    </>
  );
}
