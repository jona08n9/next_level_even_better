import React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../utils/supabaseClient';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Layout } from '@/Layout';
import { format } from 'date-fns';
import { FaCalendar, FaCoins, FaGamepad, FaMoneyBill } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import { Link } from '@radix-ui/react-navigation-menu';
import Countdown from 'react-countdown';

function page() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('turneringer')
          .select('*')
          .eq('id', router.query.id);
        if (data) {
          setData(data[0]);
        } else {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [router.query.id]);

  console.log(data);

  console.log(router.query);

  const isFrontPage = false;

  const timestamp = data && data.tilmelding;

  const dateObject = new Date(timestamp);

  const countdownDate = Date.now() + Date.parse(timestamp);

  const renderer = ({ hours, minutes, seconds, days, completed }) => {
    return (
      <span>
        {days} dage {hours}:{minutes}:{seconds}
      </span>
    );
  };

  console.log('checker', Date.now());
  console.log('checker 2', Date.parse(timestamp));

  console.log(format(dateObject, 'dd/MM HH:mm'));

  return (
    <>
      <Layout>
        {data && (
          <>
            <header
              style={{
                backgroundImage: `linear-gradient(to bottom, transparent, rgba(24,23,28, 1) 90%), url(${data.background_image})`,
              }}
              className={`flex min-h-[50vh] justify-center bg-center bg-cover bg-no-repeat pb-10`}
            >
              <div className='w-full spacer max-w-main flex flex-col justify-end'>
                <h1>{data.eventNavn}</h1>
                <h2>{data.spil}</h2>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-4 align-middle'>
                    <div className='bg-accentCol w-fit px-2 self-center rounded-full flex'>
                      <p className='text-primaryCol mt-0 font-medium'>OPEN</p>
                    </div>
                    <h4 className='mt-0'>
                      Tilmeldingsfrist D. {format(dateObject, 'dd/MM HH:mm')}
                    </h4>
                  </div>
                  <div className='flex flex-col gap-2 justify-center'>
                    <p className='text-center text-2xl'>
                      <Countdown date={Date.parse(timestamp)} />
                    </p>
                    <a href='/om-os/kontakt?turnering'>
                      <div className='w-fit px-8 py-2 font-bold uppercase rounded-sm h-min bg-accentCol'>
                        Tilmeld
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </header>
            <section className='flex justify-center'>
              <div className='spacer w-full flex-wrap flex justify-between'>
                <div className='grow'>
                  <div
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                    }}
                    className='grid gap-3'
                  >
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <FaGamepad className='inline-block' /> Spil
                      </p>
                      <p className='mt-0'>{data.spil}</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <FaCalendar size='12' />
                        Dato
                      </p>
                      <p className='mt-0'>
                        {format(new Date(data.dato), 'dd/MM HH:mm')}
                      </p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center align-middle font-bold uppercase'>
                        <BsFillPeopleFill />
                        Format
                      </p>
                      <p className='mt-0'>{data.format}</p>
                    </div>
                    <div className='p-3 w-full flex flex-col gap-2 bg-contrastCol rounded-sm'>
                      <p className='mt-0 flex gap-1 items-center font-bold uppercase'>
                        <FaCoins size='12' /> Tilmeldingspris
                      </p>
                      <p className='mt-0'>{data.gebyr}kr.</p>
                    </div>
                  </div>
                  <div>
                    <p className='text-xl uppercase font-bold'>
                      {data.subheader}
                    </p>
                    <p>{data.beskrivelse}</p>
                  </div>
                </div>

                <div>
                  <h4>Sponsorer</h4>
                </div>
              </div>
            </section>
          </>
        )}
      </Layout>
    </>
  );
}

export default page;
