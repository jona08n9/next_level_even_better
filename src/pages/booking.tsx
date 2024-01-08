import { ReactHTMLElement, ReactNode } from 'react';
import { Layout } from '@/Layout';
import { Hero } from '@/modules/Hero/Hero';
import { Input } from '@/components/Inputfields/Inputfield';
import { FaUserGroup } from 'react-icons/fa6';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoTime } from 'react-icons/io5';
import { DatePicker } from '@/components/Calender/DatePicker';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { BookingTypes } from '@/enum/BookingTimes';
import { Matcher } from 'react-day-picker';
import { BookingTimeSlot, PCObjects, TimeSlot, TimeSlotOptions, UserBooking } from '@/Types/calendar';
import { supabase } from '../../utils/supabaseClient';
import { Bookings } from '@/Types/Bookings';
import { formattedDate, futureDays, pastDays } from '@/calendarFunctions/calendarFunctions';
import timeSlots from '@/Types/TimesArray';
import { AvailibleTimeSlot } from '@/components/AvailibleTimeSlot/AvailibleTimeSlot';
import { BookedTimeSlot } from '@/components/BookedTimeSlot/BookedTimeSlot';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { FormControl, FormItem, FormLabel, FormDescription, FormMessage, FormField, Form, useFormField } from '../components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import BookingForm from '@/modules/BookingForm/BookingForm';
import { bookingCompleteAtom } from '@/states/store';
import { useAtom } from 'jotai';
import { BookingRecieved } from '@/modules/BookingRecieved/bookingRecieved';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps() {
  let { data: john, error } = await supabase.from('Bookings').select('*');

  return { props: { john } };
}

interface AlertDetails {
  start: string | undefined;
  slut: string;
  arr: string[];
}

export default function Booking({ john }: { john: Bookings[] }) {
  const [userChoices, setUserChoices] = useState<UserBooking | undefined>();
  const [amountValue, setAmountValue] = useState<number | ''>();
  const [openAmount, setOpenAmount] = useState(false);
  const [bookingComplete, setBookingComplete] = useAtom(bookingCompleteAtom);
  const [openDialogAlert, setOpenDialogAlert] = useState(false);
  const [alertDetail, setAlertDetail] = useState<AlertDetails>();
  const [timeChosen, setTimeChosen] = useState<TimeSlot>({
    time: '',
    index: undefined,
  });
  const [bookTimes, setBookTimes] = useState<string[]>([]);
  const [bookingDateTimes, setBookingDateTimes] = useState<BookingTimeSlot[]>(timeSlots);
  const amountRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Subscribe to the router's "routeChangeComplete" event
    const handleRouteChange = (url: string) => {
      //console.log(`Route changed to: ${url}`);
      setBookingComplete(false);
    };

    // Add the event listener
    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up the event listener on component unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (bookingRef.current && userChoices?.startTime?.index !== undefined && userChoices?.amount && userChoices.date) {
      setTimeout(() => {
        //@ts-ignore
        bookingRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 425);
    } else if (timeRef.current && userChoices?.amount && userChoices.date && userChoices?.startTime?.index === undefined && userChoices?.endTime?.index === undefined && timeChosen.index === undefined) {
      timeRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (dateRef.current && userChoices?.amount && userChoices?.startTime?.index === undefined && timeChosen.index === undefined) {
      dateRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userChoices]);

  //Make same function and use Enums with a switch Statement
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    //console.log(e.target.value);
    let amountChosen = e.target.value;
    if (e.target.value.length >= 1) {
      amountChosen = e.target.value.substring(e.target.value.length - 1, e.target.value.length);
      //console.log('HER1');
    }

    if (/^[1-5]$/.test(amountChosen) || amountChosen === '') {
      //console.log('HER2');
      setOpenAmount(false);
      if (/^[1-5]$/.test(amountChosen)) {
        //console.log(typeof Number(amountChosen), Number(amountChosen));
        //console.log('HER3');
        setUserChoices((prevData) => ({
          ...prevData,
          amount: Number(amountChosen),
        }));
        setAmountValue(Number(amountChosen));
      } else if (amountChosen === '') {
        //console.log('HER4');
        //console.log(typeof Number(amountChosen), Number(amountChosen));
        setUserChoices((prevData) => ({
          ...prevData,
          amount: null,
        }));
        setAmountValue('');
      }
    } else {
      setOpenAmount(true);
    }
    console.log('amountChosen', amountChosen);
  };

  const handleDateChange = (e: string) => {
    if (e === undefined) {
      setUserChoices((prevData) => ({
        ...prevData,
        date: undefined,
      }));
    } else if (e === userChoices?.date) {
      setUserChoices((prevData) => ({
        ...prevData,
        date: undefined,
      }));
    } else {
      //console.log(e);
      const date = new Date(e);
      const Year = date.getFullYear();
      const Month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const Day = String(date.getDate()).padStart(2, '0');

      const FormattedDate = `${Number(Year)}-${Number(Month)}-${Number(Day)}`;

      setUserChoices((prevData) => ({
        ...prevData,
        date: FormattedDate,
      }));
      bookingTimes(FormattedDate);
      editBookedTimes('', 0, BookingTypes.ClearAll);
    }
  };

  function bookingTimes(chosenDate: string) {
    const matchingDate = Boolean(
      //@ts-ignore
      john.find((booking) => booking.date === chosenDate)
    );

    console.log(john);
    console.log(matchingDate);
    if (!matchingDate) {
      setBookingDateTimes(timeSlots);
      console.log('!matchingDate, 171');
      return;
    }
    console.log('matchingDate, 174');
    //@ts-ignore
    const dateBooking = john.find((booking) => booking.date === chosenDate);
    const PCS: PCObjects = {
      PC1: dateBooking?.PC1,
      PC2: dateBooking?.PC2,
      PC3: dateBooking?.PC3,
      PC4: dateBooking?.PC4,
      PC5: dateBooking?.PC5,
    };

    const availibleTimes: BookingTimeSlot[] = [];

    for (const pc in PCS) {
      // Iterate over each entry for the current PC
      // @ts-ignore
      for (const entry of PCS[pc]) {
        console.log(entry);
        // Find the corresponding entry in the resultArray or create a new one
        const resultEntry: BookingTimeSlot | undefined = availibleTimes.find((item) => item.time === entry.time);

        if (resultEntry) {
          // If the entry exists, update the count based on the booked status
          if (entry.booked) {
            resultEntry.bookedCount = (resultEntry.bookedCount || 0) + 1;
          }
        } else {
          // If the entry doesn't exist, create a new one
          const newEntry = {
            time: entry.time,
            bookedCount: entry.booked ? 1 : 0,
          };
          availibleTimes.push(newEntry);
        }
      }
    }

    for (let i = 0; i < availibleTimes.length; i++) {
      if (i < 12) {
        // @ts-ignore
        if (
          //@ts-ignore
          availibleTimes[i].bookedCount > 4 &&
          //@ts-ignore
          (availibleTimes[i + 1].bookedCount > 4 ||
            //@ts-ignore
            availibleTimes[i - 1].bookedCount > 4)
        ) {
          availibleTimes[i].booked = true;
        } else {
          availibleTimes[i].booked = false;
        }
      } else if (i === 12) {
        // @ts-ignore
        if (availibleTimes[i].bookedCount > 4) {
          availibleTimes[i].booked = true;
        } else {
          availibleTimes[i].booked = false;
        }
      }
    }
    console.log('availibleTimes', availibleTimes);
    setBookingDateTimes(availibleTimes);
  }

  function addTime(tid: string, index: number) {
    if (timeChosen.index === undefined) {
      // //console.log('!timeChosen');
      if (userChoices?.startTime?.index || userChoices?.endTime?.index) {
        // //console.log('userChoices?.startTime?.index && userChoices?.endTime?.index');
        if (userChoices?.startTime?.index === index) {
          // //console.log('userChoices?.startTime?.index === index');
          editBookedTimes(tid, index, BookingTypes.SingleValueEnd);
        } else if (userChoices?.endTime?.index === index) {
          // //console.log('userChoices?.endTime?.index === index');
          editBookedTimes(tid, index, BookingTypes.SingleValueStart);
          setTimeChosen({
            //@ts-ignore
            time: userChoices.startTime.time,
            //@ts-ignore
            index: userChoices.startTime.index,
          });
          //@ts-ignore
          setBookTimes([userChoices?.startTime?.time]);
          setUserChoices((prevData) => ({
            ...prevData,
            endTime: { time: '', index: undefined },
            startTime: { time: '', index: undefined },
          }));
        } else {
          // //console.log('Check hvilken værdi som er tættest på tid/index, skift rundt');

          // Skal der køres script her som tjekker om der er nogle booked dates i mellem?
          //@ts-ignore
          const diffStart = Math.abs(userChoices?.startTime?.index - index); // Calculate absolute difference between constant1 and targetValue
          //@ts-ignore
          const diffSlut = Math.abs(userChoices?.endTime?.index - index); // Calculate absolute difference between constant2 and targetValue

          // //console.log('diffStart:', diffStart, 'diffSlut:', diffSlut);

          if (diffStart < diffSlut) {
            // //console.log"Index closes to startTime");
            editBookedTimes(tid, index, BookingTypes.UpdateStart);
            // timesArray(index, BookingTypes.StartLowerEnd);
          } else if (diffStart > diffSlut) {
            // //console.log"Index closes to endTime");
            editBookedTimes(tid, index, BookingTypes.UpdateEnd);
            // timesArray(index, BookingTypes.StartHigherEnd);
          } else {
            editBookedTimes(tid, index, BookingTypes.UpdateStart);
          }
        }
      } else {
        // //console.log('UserChoices Empty --> timeChosen = tid + index');
        editBookedTimes(tid, index, BookingTypes.SingleValue);
      }
    } else if (timeChosen.index === index) {
      // //console.log('Sæt timeChosen === ()');
      editBookedTimes(tid, index, BookingTypes.ClearTimeChosen);
      setTimeChosen({ time: '', index: undefined });
    } else if (timeChosen.index !== index && timeChosen.index !== undefined) {
      if (timeChosen.index < index) {
        // //console.log('timeChosen er lavere end index - Sæt timeChosen til starr.');
        editBookedTimes(tid, index, BookingTypes.SetStartToTimeChosen);
      } else if (timeChosen.index > index) {
        // //console.log('timeChosen højere end index - Sæt timeChosen til end.');
        editBookedTimes(tid, index, BookingTypes.SetEndToTimeChosen);
      }
    }
    console.log('timeChosen', timeChosen);
    console.log('userChoices', userChoices);
  }

  function editBookedTimes(tid: string, index: number, statement: string | undefined) {
    let isolatedArray: BookingTimeSlot[];
    let bookInstance: boolean;
    let newBookTimes: string[] = [];

    switch (statement) {
      case BookingTypes.SingleValue:
        setBookTimes([tid]);
        setTimeChosen({ time: tid, index: index });
        setUserChoices((prevData) => ({
          ...prevData,
          startTime: { time: '', index: undefined },
          endTime: { time: '', index: undefined },
        }));
        break;
      case BookingTypes.SingleValueEnd:
        if (userChoices?.endTime?.index !== undefined) {
          setTimeChosen({
            time: userChoices.endTime.time,
            index: userChoices.endTime.index,
          });
          //@ts-ignore
          setBookTimes([userChoices?.endTime?.time]);
          setUserChoices((prevData) => ({
            ...prevData,
            startTime: { time: '', index: undefined },
            endTime: { time: '', index: undefined },
          }));
        }
        break;
      case BookingTypes.SingleValueStart:
        if (userChoices?.startTime?.index !== undefined) {
          setTimeChosen({
            time: userChoices.startTime.time,
            index: userChoices.startTime.index,
          });
          //@ts-ignore
          setBookTimes([userChoices?.startTime?.time]);
          setUserChoices((prevData) => ({
            ...prevData,
            endTime: { time: '', index: undefined },
            startTime: { time: '', index: undefined },
          }));
        }
        break;
      case BookingTypes.ClearTimeChosen:
        setBookTimes([]);
        break;
      case BookingTypes.SetStartToTimeChosen:
        //Set startTime to same value as timeChosen and set endTime to the new value "tid" - IF no booked spaces between, else come with error
        //@ts-ignore
        isolatedArray = bookingDateTimes.slice(timeChosen.index, index + 1);
        bookInstance = isolatedArray.some((el) => el.booked === true);

        //console.log('isolatedArray, SetStartToTimeChosen', isolatedArray);

        if (bookInstance) {
          // Lav en Alert Dialog som kommer op. Vælg ny tid.
          errorMessagePopUp(timeChosen.time, tid, isolatedArray);
          setOpenDialogAlert(true);
        } else {
          setUserChoices((prevData) => ({
            ...prevData,
            endTime: { time: tid, index: index },
            startTime: { time: timeChosen.time, index: timeChosen.index },
          }));
          setTimeChosen({ time: '', index: undefined });
          for (let i = 0; i < isolatedArray.length; i++) {
            newBookTimes.push(isolatedArray[i].time);
          }
          setBookTimes(newBookTimes);
        }
        break;
      case BookingTypes.SetEndToTimeChosen:
        //Set endTime to same value as timeChosen and set startTime to the new value "tid" - IF no booked spaces between, else come with error
        //@ts-ignore
        isolatedArray = bookingDateTimes.slice(index, timeChosen.index + 1);
        bookInstance = isolatedArray.some((el) => el.booked === true);

        //console.log('isolatedArray, SetEndToTimeChosen', isolatedArray);

        if (bookInstance) {
          // Lav en Alert Dialog som kommer op. Vælg ny tid.
          //@ts-ignore
          errorMessagePopUp(tid, timeChosen.time, isolatedArray);
          setOpenDialogAlert(true);
        } else {
          setUserChoices((prevData) => ({
            ...prevData,
            startTime: { time: tid, index: index },
            endTime: { time: timeChosen.time, index: timeChosen.index },
          }));
          setTimeChosen({ time: '', index: undefined });
          for (let i = 0; i < isolatedArray.length; i++) {
            newBookTimes.push(isolatedArray[i].time);
          }
          setBookTimes(newBookTimes);
        }
        break;
      case BookingTypes.UpdateStart:
        //Index er tættest på start, så det er denne der skal opdateres - hvis ikke der er bookinger i vejen!
        if (userChoices?.startTime?.index !== undefined && index > userChoices?.startTime?.index) {
          //@ts-ignore
          isolatedArray = bookingDateTimes.slice(userChoices.startTime.index, index + 1);
          bookInstance = isolatedArray.some((el) => el.booked === true);

          //console.log('isolatedArray, UpdateStart1', isolatedArray);
          if (bookInstance) {
            errorMessagePopUp(userChoices.startTime.time, tid, isolatedArray);
            setOpenDialogAlert(true);
          } else {
            let newBookArray: BookingTimeSlot[] = bookingDateTimes.slice(
              index,
              //@ts-ignore
              userChoices?.endTime?.index + 1
            );
            for (let i = 0; i < newBookArray.length; i++) {
              newBookTimes.push(newBookArray[i].time);
            }
            setBookTimes(newBookTimes);
            setUserChoices((prevData) => ({
              ...prevData,
              startTime: { time: tid, index: index },
            }));
          }
        } else if (userChoices?.startTime?.index !== undefined && index < userChoices?.startTime.index) {
          //@ts-ignore
          isolatedArray = bookingDateTimes.slice(index, userChoices.startTime.index + 1);
          bookInstance = isolatedArray.some((el) => el.booked === true);

          //console.log('isolatedArray, UpdateStart2', isolatedArray);

          if (bookInstance) {
            //@ts-ignore
            errorMessagePopUp(tid, userChoices.startTime.time, isolatedArray);
            setOpenDialogAlert(true);
          } else {
            let newBookArray: BookingTimeSlot[] = bookingDateTimes.slice(
              index,
              //@ts-ignore
              userChoices?.endTime?.index + 1
            );
            for (let i = 0; i < newBookArray.length; i++) {
              newBookTimes.push(newBookArray[i].time);
            }
            setBookTimes(newBookTimes);
            setUserChoices((prevData) => ({
              ...prevData,
              startTime: { time: tid, index: index },
            }));
          }
        }
        break;
      case BookingTypes.UpdateEnd:
        if (userChoices?.endTime?.index !== undefined && index > userChoices?.endTime?.index) {
          //@ts-ignore
          isolatedArray = bookingDateTimes.slice(userChoices.endTime.index, index + 1);
          bookInstance = isolatedArray.some((el) => el.booked === true);

          //console.log('isolatedArray, UpdateEnd1', isolatedArray);

          if (bookInstance) {
            errorMessagePopUp(userChoices.endTime.time, tid, isolatedArray);
            setOpenDialogAlert(true);
          } else {
            let newBookArray: BookingTimeSlot[] = bookingDateTimes.slice(userChoices?.startTime?.index, index + 1);
            for (let i = 0; i < newBookArray.length; i++) {
              newBookTimes.push(newBookArray[i].time);
            }
            setBookTimes(newBookTimes);
            setUserChoices((prevData) => ({
              ...prevData,
              endTime: { time: tid, index: index },
            }));
          }
        } else if (userChoices?.endTime?.index !== undefined && index < userChoices?.endTime.index) {
          //@ts-ignore
          isolatedArray = bookingDateTimes.slice(index, userChoices.endTime.index + 1);
          bookInstance = isolatedArray.some((el) => el.booked === true);

          //console.log('isolatedArray, UpdateEnd2', isolatedArray);

          if (bookInstance) {
            //@ts-ignore
            errorMessagePopUp(tid, userChoices.endTime.time, isolatedArray);
            setOpenDialogAlert(true);
          } else {
            let newBookArray: BookingTimeSlot[] = bookingDateTimes.slice(userChoices?.startTime?.index, index + 1);
            for (let i = 0; i < newBookArray.length; i++) {
              newBookTimes.push(newBookArray[i].time);
            }
            setBookTimes(newBookTimes);
            setUserChoices((prevData) => ({
              ...prevData,
              endTime: { time: tid, index: index },
            }));
          }
        }
        break;
      case BookingTypes.ClearAll:
        setTimeChosen({ time: '', index: undefined });
        setBookTimes([]);
        setUserChoices((prevData) => ({
          ...prevData,
          endTime: { time: '', index: undefined },
          startTime: { time: '', index: undefined },
        }));
        break;
    }
  }

  const disabledDays123 = (numberOfDays: number): Matcher | Matcher[] | undefined => {
    const disabledDays: Date[] = [];
    const daysInWeek = 7;
    // //console.log"numberOfDays", numberOfDays);

    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);

      const dayOfWeek = currentDate.getDay();
      // 5 corresponds to Friday and 6 corresponds to Saturday
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(currentDate.getDate()).padStart(2, '0');

        // Format the date as "YYYY, MM, DD"
        const formattedDate = `${Number(year)}, ${Number(month)}, ${Number(day)}`;

        disabledDays.push(new Date(formattedDate));
      }
    }

    disabledDays.push(pastDays());
    disabledDays.push(futureDays(numberOfDays));
    if (john.length > 0) {
      console.log('1');
      for (let i = 0; i < john.length; i++) {
        const date = john[i].date;
        const inputDate = new Date(date);

        // Get the current date
        const currentDate = new Date();

        // Calculate the date 14 days in the future
        const futureDate = new Date();
        futureDate.setDate(currentDate.getDate() + numberOfDays);

        // Check if the inputDate is between currentDate and futureDate
        if (inputDate >= currentDate && inputDate <= futureDate && userChoices?.amount !== undefined) {
          console.log('2');
          const PCS: PCObjects = {
            PC1: john[i].PC1,
            PC2: john[i].PC2,
            PC3: john[i].PC1,
            PC4: john[i].PC1,
            PC5: john[i].PC1,
          };

          console.log('PCS', PCS);

          // Create a new array to store the results
          const resultArray: BookingTimeSlot[] = [];

          // Iterate over each key in the inputObject
          for (const pc in PCS) {
            // Iterate over each entry for the current PC
            // @ts-ignore
            for (const entry of PCS[pc]) {
              // Find the corresponding entry in the resultArray or create a new one
              const resultEntry: BookingTimeSlot | undefined = resultArray.find((item) => item.time === entry.time);
              if (resultEntry) {
                console.log('entry', entry);
                // If the entry exists, update the count based on the booked status
                if (entry.booked) {
                  resultEntry.bookedCount = (resultEntry.bookedCount || 0) + 1;
                }
              } else {
                // If the entry doesn't exist, create a new one
                const newEntry = {
                  time: entry.time,
                  bookedCount: entry.booked ? 1 : 0,
                };
                resultArray.push(newEntry);
              }
            }
          }

          console.log('resultArray', resultArray);
          const PCLedigeTider = resultArray.some((slot, index) => {
            //@ts-ignore
            const maxPC = 5 - userChoices?.amount;

            if (index < resultArray.length && slot.bookedCount !== undefined) {
              console.log('3');
              const nextSlot = resultArray[index + 1];
              //@ts-ignore
              // console.log(slot.bookedCount < maxPC && nextSlot.bookedCount < maxPC);
              //@ts-ignore
              return slot.bookedCount < maxPC && nextSlot.bookedCount < maxPC;
            }
            // return false;
          });
          console.log('resultArray2', resultArray);
          // console.log('PCLedigeTider', PCLedigeTider);
          if (PCLedigeTider === true) {
            console.log('4');
            //console.log('ledige tider', PCLedigeTider);
          } else {
            console.log('5');
            //console.log('ledige tider?', PCLedigeTider);
            // //console.log(new Date(bookings[i].date));
            disabledDays.push(new Date(john[i].date));
          }
        }
      }
    }
    // //console.log"disabledDays", disabledDays);
    console.log(disabledDays);
    return disabledDays;
  };

  const disabledDays: Matcher | Matcher[] | undefined = disabledDays123(21);

  // function bookPCTimes(PC: BookingTimeSlot[], times: string[]) {}
  function errorMessagePopUp(start: string | undefined, slut: string, arr: BookingTimeSlot[]) {
    const errorTimes: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].booked === true) {
        errorTimes.push(arr[i].time);
      }
    }
    setAlertDetail({ start: start, slut: slut, arr: errorTimes });
    //console.log(alertDetail);
  }

  const timeChosenConstStart = () => {
    if (userChoices?.startTime?.index === undefined && timeChosen.time === '') {
      return <span className='font-bold text-accentCol'>Du skal væle en start tid!</span>;
    } else if (timeChosen.time !== '' && userChoices?.startTime?.index === undefined) {
      return <span className='font-bold text-accentCol'>{timeChosen.time}</span>;
    } else {
      return <span className='font-bold text-accentCol'>{userChoices?.startTime?.time}</span>;
    }
  };

  const timeChosenConstEnd = () => {
    if (timeChosen.index !== undefined) {
      if (timeChosen.index === 0) {
        return <span className='font-bold text-accentCol'>Vælg et sluttidspunkt.</span>;
      } else if (timeChosen.index === 12) {
        return <span className='font-bold text-accentCol'>Du kan ikke starte klokken 20.00, så vælg en tid der er din start tid - din bandit :-) </span>;
      } else if (timeChosen.index > 0) {
        return <span className='font-bold text-accentCol'>Vælg entent et tidligere tidspunkt for at ændre din start tid, eller et senere tidspunkt for at vælge din sluttid.</span>;
      }
    }
  };

  // const handleBookingChange = (statement: string, value: string) => {
  //   switch (statement) {
  //     case BookingTypes.FormName:
  //       // @ts-ignore
  //       form.setValue('navn', value);
  //       break;
  //     case BookingTypes.FormPhone:
  //       form.setValue('telefon', value);
  //       break;
  //     case BookingTypes.FormEmial:
  //       form.setValue('email', value);
  //       break;
  //   }
  // };

  return (
    <>
      <Head>
        <title>Book din Gaming Oplevelse hos Next Level Gaming</title>
        <meta name='description' content='Reserver din gaming session hos Next Level Gaming. Vores online booking system gør det nemt at sikre pladser og computere til din næste gaming oplevelse. Perfekt til både individuelle spillere og grupper, vores center tilbyder fleksible bookinger. Nyd topmoderne gaming udstyr og en hyggelig atmosfære. Book nu for at sikre en uforglemmelig gaming dag i Glostrup.' />
      </Head>
      <Layout>
        <main>
          <Hero header="Book DK's mest unikke gaming oplevelse" redWord={['unikke']} isFrontPage={false} content='På Next Level Gaming kan du forudbestille computere og sikre dig en plads til at nyde spillet uden travlhed. Book nu for at garantere en hyggelig og afslappende spiloplevelse, hvor du kan dykke ned i nye verdener og opleve spændingen ved gaming i komfortable omgivelser. Gør din spilletid speciel med vores avancerede udstyr og venlige atmosfære.' />
          {bookingComplete !== false ? (
            // @ts-ignore
            <BookingRecieved userChoices={userChoices} />
          ) : (
            <AnimatePresence>
              <section id='bookingBlock' className='spacer'>
                <article id='antalGuests' className='w-full' ref={amountRef}>
                  <div className='bg-contrastCol mt-8 p-4 lg:block min-h-[152px]'>
                    <h4 className='mt-0'>Hvor mange computere vil du booke?</h4>
                    <p> For at vi kan checke om der er PC'er nok til jer, så vil vi gerne vide hvor mange I kommer. </p>
                  </div>
                  <div className='bg-contrastCol md:mt-8 p-4 lg:block min-h-[152px]'>
                    <h4 className='mt-0 flex flex-row align-middle gap-x-2'>
                      <FaUserGroup className='inline-block mt-0.4' />
                      <span>Antal computere</span>
                    </h4>
                    <span>(max 5)</span>
                    <span className={openAmount ? 'block text-accentCol' : 'hidden'}>Du må max vælge et tal mellem 1-5.</span>
                    <Input type='number' className='border-white remove-arrow' onChange={handleAmountChange} value={amountValue}></Input>
                  </div>
                </article>
                {amountValue !== undefined && Number(amountValue) < 6 && Number(amountValue) > 0 ? (
                  <motion.article
                    ref={dateRef}
                    id='date'
                    className='w-full'
                    initial={{ opacity: 0, y: '-50%' }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      duration: 0.3,
                      ease: [0, 0.71, 0.2, 1.01],
                    }}
                  >
                    <div className='bg-contrastCol mt-8 p-4 lg:block'>
                      <h4 className='mt-0'>Hvilken dag vil i komme?</h4>
                      <p>
                        {' '}
                        I kan booke tid 14 dage frem og alle ledige datoer vil være markeret med grøn farve. Dage vi er fuldt bookede er market med rød. <br />
                        <br />
                        <b>Obs.</b> vi modtager ikke bookinger fredag og lørdag. Alle andre dage kan du booke ml. 14 - 20
                      </p>
                    </div>
                    <div className='bg-contrastCol md:mt-8 p-4 lg:block'>
                      <h4 className='mt-0 flex flex-row align-middle gap-x-2'>
                        <FaCalendarAlt className='inline-block mt-0.4' />
                        <span>Dato</span>
                      </h4>
                      <span>{userChoices?.date === undefined ? '' : `${formattedDate(userChoices?.date)}`}</span>
                      <DatePicker
                        // @ts-ignore
                        disabledDays={disabledDays}
                        onSelect={handleDateChange}
                      ></DatePicker>
                    </div>
                  </motion.article>
                ) : (
                  ''
                )}
                {amountValue !== undefined && Number(amountValue) < 6 && Number(amountValue) > 0 && userChoices?.date !== undefined ? (
                  <motion.article
                    ref={timeRef}
                    id='time'
                    className='w-full'
                    initial={{ opacity: 0, y: '-50%' }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      duration: 0.3,
                      ease: [0, 0.71, 0.2, 1.01],
                    }}
                  >
                    <div className='bg-contrastCol mt-8 p-4 lg:block'>
                      <h4 className='mt-0'>Hvor længe skal i game?</h4>
                      <p>Vi booker i tidsrummet 14.00 - 20.00, vælg hvor mange timer og hvornår i vil booke pc'er, ud fra de ledige tider for neden</p>
                    </div>
                    <div className='bg-contrastCol md:mt-8 p-4 lg:block'>
                      <h4 className='mt-0 flex flex-row align-middle gap-x-2'>
                        <IoTime className='inline-block mt-0.4' />
                        <span>Antal timer</span>
                        {/* <button className='p-4 border border-white ' onClick={() => //console.log(bookTimes)}>
                        Check Booking Status
                      </button>
                      <button className='p-4 border border-white ' onClick={() => //console.log(john)}>
                        Check Supabase
                      </button>
                      <button className='p-4 border border-white ' onClick={() => //console.log(userChoices)}>
                        Check Choices State
                      </button>
                      <button className='p-4 border border-white ' onClick={() => //console.log(timeChosen)}>
                        Check timeChosen
                      </button>
                      <button className='p-4 border border-white ' onClick={() => //console.log(bookingDateTimes)}>
                        Check Boking Date Times
                      </button> */}
                      </h4>
                      <p>
                        <span onClick={() => console.log(timeChosen, userChoices)}>Start tid - </span>
                        {timeChosenConstStart()}
                      </p>
                      {timeChosen.time === '' && userChoices?.startTime?.index === undefined ? (
                        ''
                      ) : (
                        <motion.article
                          className='w-full'
                          initial={{ opacity: 0, y: '-50%' }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 100,
                            duration: 0.3,
                            ease: [0, 0.71, 0.2, 1.01],
                          }}
                        >
                          <p>
                            <span>Slut tid - </span>
                            {timeChosen.time === '' && userChoices?.startTime?.index !== undefined ? <span className='font-bold text-accentCol'>{userChoices?.endTime?.time}</span> : <>{timeChosenConstEnd()}</>}
                          </p>
                        </motion.article>
                      )}
                      <div className='mt-3'>
                        {userChoices?.startTime?.index === undefined || userChoices?.endTime?.time === undefined ? (
                          ''
                        ) : (
                          <motion.article
                            className='w-full'
                            initial={{ opacity: 0, y: '-50%' }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 100,
                              duration: 0.3,
                              ease: [0, 0.71, 0.2, 1.01],
                            }}
                          >
                            <p>
                              Antal timer:
                              <span className=' ml-1 font-bold text-accentCol'>
                                {Math.abs(
                                  userChoices?.startTime?.index -
                                    // @ts-ignore
                                    userChoices?.endTime?.index
                                ) / 2}
                              </span>
                            </p>
                          </motion.article>
                        )}
                      </div>
                      <div className=' timeslots flex gap-2 flex-wrap mt-3'>
                        {bookingDateTimes.map((time: BookingTimeSlot, index: number) => (
                          <div className='relative flex justify-between gap-2 flex-wrap mt-3'>
                            {time.booked ? (
                              <BookedTimeSlot time={time} index={index} allTimes={bookingDateTimes} userChoices={userChoices} />
                            ) : (
                              //  <input type="checkbox" name="tid" id={time.time} key={index} className="absolute z-0 opacity-0 peer" defaultChecked={bTS.includes(index)} disabled={time.booked} />
                              // <label
                              //   htmlFor={time.time}
                              //   onClick={() => addTime(time.time, index)}
                              //   className={
                              //     (startTid.index !== undefined && slutTid.index !== undefined && startTid.index !== null && slutTid.index !== null && index >= startTid.index && index <= slutTid.index) || startTid.index === index || slutTid.index === index
                              //       ? "z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer bg-accentCol peer-disabled:bg-slate-500 peer-disabled:border-slate-500 peer-disabled:text-slate-700 peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed"
                              //       : "z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer peer-disabled:bg-slate-500 peer-disabled:border-slate-500 peer-disabled:text-slate-700 peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed"
                              //   }
                              // >
                              //   {time.time}
                              // </label>
                              <AvailibleTimeSlot className={bookTimes.includes(time.time) ? 'z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer bg-accentCol' : 'z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer'} defaultChecked={bookTimes.includes(time.time)} index={index} onClick={() => addTime(time.time, index)} time={time} />
                            )}
                          </div>
                        ))}
                        <AlertDialog open={openDialogAlert} onOpenChange={setOpenDialogAlert}>
                          <AlertDialogContent className='max-w-[300px] sm:max-w-[400px]'>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Du kan ikke booke her.</AlertDialogTitle>
                              <AlertDialogDescription className='text-left'>
                                Det er ikke muligt at booke fra <span className='font-semibold'>{alertDetail?.start}</span> til <span className='font-semibold'>{alertDetail?.slut}</span>, da følgende tider er fuldt bookede:{' '}
                                <ul className='flex flex-col pt-2'>
                                  {alertDetail?.arr.map((tid) => (
                                    <li className='mt-1'>
                                      <span className='font-semibold'>{tid}</span>
                                    </li>
                                  ))}
                                </ul>
                                <span className='mt-2 block'>Vælg en ny tid, som ikke går ind over de bookede tider.</span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogAction>Fortsæt</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.article>
                ) : (
                  ''
                )}
                {amountValue !== undefined && Number(amountValue) < 6 && Number(amountValue) > 0 && userChoices?.date !== undefined && userChoices?.startTime?.index !== undefined && userChoices.endTime?.index !== undefined ? (
                  <motion.article
                    id='personalInfo'
                    ref={bookingRef}
                    className='w-full'
                    initial={{ opacity: 0, y: '-50%' }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      delay: 0.4,
                      duration: 0.3,
                      ease: [0, 0.71, 0.2, 1.01],
                    }}
                  >
                    {/* <div ref={bookingRef}> */}
                    <BookingForm userChoices={userChoices} bookingOverview={john} />
                    {/* </div> */}
                  </motion.article>
                ) : (
                  ''
                )}
              </section>
            </AnimatePresence>
          )}
        </main>
      </Layout>
    </>
  );
}
