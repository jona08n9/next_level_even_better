import React, { useEffect } from 'react';
import Image from 'next/image';
import { IoGameController } from 'react-icons/io5';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaTrophy } from 'react-icons/fa6';
import { format } from 'date-fns';
import Countdown from 'react-countdown';
import { Turnering } from '@/pages/events/turneringer';

function TurneringKort({ datas }: { datas: Turnering }) {
  const turnering = datas;

  const timestamp = turnering && turnering.tilmelding;

  const dateObject = new Date(timestamp);

  const countdownDate = Date.now() + Date.parse(timestamp);

  return (
    <>
      {turnering && (
        <div className='flex flex-col border-4 w-fit rounded-lg bg-primaryCol relative '>
          <div className='flex w-auto h-auto col-start-1 row-start-1 aspect-video overflow-hidden'>
            <Image
              src={turnering.background_image}
              width={400}
              height={300}
              quality={20}
              style={{ objectFit: 'cover' }}
              alt='Picture of the author'
              className='row-span-1 col-span-1 overflow-hidden'
            />
            <div className='aspect-video absolute flex flex-col w-full h-auto justify-between p-2 bg-gradient-to-t from-primaryCol to-transparent z-10'>
              <div className='flex gap-2 justify-end'>
                <div className='bg-[#08ef8e] w-fit h-min px-2 rounded-full flex self-center uppercase'>
                  <small className='mt-0 text-primaryCol font-bold'>
                    {turnering.tilmelding_open ? 'Åben for tilmelding' : 'Lukket for tilmelding'}
                  </small>
                </div>
              </div>
              <div className='flex flex-col justify-end mt-auto'>
                <div className='flex flex-row gap-2'>
                  {' '}
                  Tilmeldingen lukker om
                  <Countdown date={Date.parse(timestamp)} />
                </div>
              </div>
              <div className=''>
                <h2 className='mt-0 md:truncate md:max-w-[20ch] text-2xl not-italic'>
                  {turnering.eventNavn}
                </h2>
              </div>
            </div>
          </div>

          <div className='h-fit p-2 '>
            <div className='flex flex-row gap-2 mb-2'>
              <IoGameController />
              <p className='mt-0'>{turnering.spil}</p>
            </div>
            <div className='flex flex-row gap-2 mb-2'>
              <FaCalendarAlt />
              <p className='mt-0'>{format(dateObject, 'dd/MM HH:mm')}</p>
            </div>
            <div className='flex flex-row gap-2 mb-2'>
              <FaTrophy />
              <p className='mt-0'>{turnering.premie}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TurneringKort;
