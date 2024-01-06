import { LayoutAdmin } from '@/Layout_Admin';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import TurneringCards from '@/components/Cards/TurneringCards';
import { showAddTurneringAtom } from '@/states/store';
import { Skeleton } from '@/components/ui/skeleton';
import { TurneringsListe } from './TurneringsListe';

export const fetchDBTurneringData = async () => {
  let { data, error } = await supabase.from('turneringer').select('*');
  return data;
};

export default function Turneringer() {
  // COMMENT OUT FROM HERE TO DISABLE LOGIN GUARD
  const router = useRouter();

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
