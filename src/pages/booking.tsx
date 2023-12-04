import { Layout } from "@/Layout";
import { Hero } from "@/modules/Hero/Hero";
import { Input } from "@/components/Inputfields/Inputfield";
import { FaPersonWalkingDashedLineArrowRight, FaUserGroup } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { IoTime } from "react-icons/io5";
import { DatePicker } from "@/components/Calender/DatePicker";
import { ReactNode, useState } from "react";

export default function Booking() {
  interface TimeSlot {
    time: string;
    index?: number;
  }

  const ledigeTider: Array<string> = ["14.00", "14.30", "15.00", "15.30", "16.00", "16.30", "17.00", "17.30", "18.00", "18.30", "19.00", "19.30", "20.00"];
  const [startTid, setStartTid] = useState<TimeSlot>({ time: "", index: undefined });
  const [slutTid, setSlutTid] = useState<TimeSlot>({ time: "", index: undefined });
  const [totalTime, setTotalTime] = useState<number>(0);
  const addTime = (tid: string, index: number) => {
    console.log("We are in");

    if (!startTid.time && !slutTid.time) {
      console.log("!startTid.time");
      setStartTid({ time: tid, index: index });
    } else if (!slutTid.time) {
      console.log("!slutTid.time");
      // @ts-ignore
      if (startTid.index < index) {
        console.log("startTid.index < index");
        setSlutTid({ time: tid, index: index });

        // @ts-ignore
      } else if (startTid.index > index) {
        console.log("startTid.index > index");
        setStartTid({ time: tid, index: index });
        setSlutTid({ time: startTid.time, index: startTid.index });
      } else if (startTid.index === index) {
        setStartTid({ time: "", index: undefined });
      }
    } else if (!startTid.time) {
      // @ts-ignore
      if (slutTid.index > index) {
        console.log("slutTid.index > index");
        setStartTid({ time: tid, index: index });

        // @ts-ignore
      } else if (slutTid.index < index) {
        console.log("slutTid.index < index");
        setSlutTid({ time: tid, index: index });
        setStartTid({ time: slutTid.time, index: slutTid.index });
      } else if (slutTid.index === index) {
        setSlutTid({ time: "", index: undefined });
      }
    } else {
      console.log("startTid.index && slutTid.index has value");
      if (startTid.index === index) {
        console.log("startTid.index === index");
        setStartTid({ time: "", index: undefined });
      } else if (slutTid.index === index) {
        console.log("slutTid.index === index");
        setSlutTid({ time: "", index: undefined });
      } else {
        // @ts-ignore
        const diffStart = Math.abs(startTid.index - index); // Calculate absolute difference between constant1 and targetValue
        // @ts-ignore
        const diffSlut = Math.abs(slutTid.index - index); // Calculate absolute difference between constant2 and targetValue

        if (diffStart < diffSlut) {
          console.log("Index closes to startTime");
          setStartTid({ time: tid, index: index });
        } else if (diffStart > diffSlut) {
          console.log("Index closes to endTime");
          setSlutTid({ time: tid, index: index });
        } else {
          console.log("Same same, tag og ændre startTiden");
          setStartTid({ time: tid, index: index });
        }
      }
      //@ts-ignore
      console.log("vi er ved Total Time");
    }
    console.log(`StartTid: ${startTid.time}, ${startTid.index}`);
    console.log(`SlutTid: ${slutTid.time}, ${slutTid.index}`);
  };

  return (
    <>
      <Layout>
        <main>
          <Hero header="Book DK's mest unikke gaming oplevelse" redWord={["unikke"]} isFrontPage={false} content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non urna aliquet, mollis lacus sed, dignissim lectus. Curabitur eget diam volutpat, facilisis massa nec, varius nulla." />
          <section>
            <article id="antalGuests" className="w-full">
              <div className="bg-contrastCol mt-8 p-4 lg:block">
                <h4 className="mt-0">Hvor mange kommer i?</h4>
                <p> For at vi kan checke om der er PC'er nok til jer, så vil vi gerne vide hvor mang i kommer. </p>
              </div>
              <div className="bg-contrastCol md:mt-8 p-4 lg:block">
                <p className="mt-0 flex flex-row align-middle gap-x-2">
                  <FaUserGroup className="inline-block mt-0.4" />
                  <span>Antal (max 5)</span>
                </p>
                <Input type="number" max={5} min={1} className="border-white"></Input>
              </div>
            </article>
            <article id="date" className="w-full">
              <div className="bg-contrastCol mt-8 p-4 lg:block">
                <h4 className="mt-0">Hvilken dag vil i komme?</h4>
                <p> I kan booke tid 14 dage frem og alle ledige datoer vil være markeret med grøn farve. Dage vi er fuldt bookede er market med rød.</p>
              </div>
              <div className="bg-contrastCol md:mt-8 p-4 lg:block">
                <p className="mt-0 flex flex-row align-middle gap-x-2">
                  <FaCalendarAlt className="inline-block mt-0.4" />
                  <span>Dato</span>
                </p>
                <DatePicker></DatePicker>
              </div>
            </article>
            <article id="time" className="w-full">
              <div className="bg-contrastCol mt-8 p-4 lg:block">
                <h4 className="mt-0">Hvor længe skal i game?</h4>
                <p>Vi booker i tidsrummet 14.00 - 20.00, vælg hvor mange timer og hvornår i vil booke pc'er, ud fra de ledige tider for neden</p>
              </div>
              <div className="bg-contrastCol md:mt-8 p-4 lg:block">
                <p className="mt-0 flex flex-row align-middle gap-x-2">
                  <IoTime className="inline-block mt-0.4" />
                  <span>Tid</span>
                </p>
                <div className="mt-3">
                  {!startTid.time && !slutTid.time ? (
                    ""
                  ) : (
                    <p>
                      Tidspunkt:
                      {!startTid.time ? "" : <span className="font-semibold"> {startTid.time} </span>} -{!slutTid.time ? "" : <span className="font-semibold"> {slutTid.time} </span>}
                      {!startTid.time || !slutTid.time ? (
                        ""
                      ) : (
                        <span>
                          Timer:
                          {/* @ts-ignore */}
                          {Math.abs(startTid.index - slutTid.index) / 2}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {ledigeTider.map((tid: string, index: number) => (
                    //@ts-ignore
                    <div className="relative flex gap-2 flex-wrap mt-3">
                      {/* @ts-ignore */}
                      <label htmlFor={tid} key={index} onClick={() => addTime(tid, index)} className={(startTid.index !== null && startTid.index !== null && index >= startTid.index && index <= slutTid.index) || startTid.index === index || slutTid.index === index ? "z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer bg-accentCol" : " z-10 min-w-[85px] text-center py-2 border border-accentCol font-semibold transition ease-in-out duration-150 cursor-pointer"}>
                        {tid}
                      </label>
                      <input type="checkbox" name="tid" id={tid} key={index} className="absolute z-0 opacity-0" />
                    </div>
                  ))}
                </div>
              </div>
            </article>
            <article id="personalInfo" className="w-full">
              <div>
                {" "}
                <h3>INDSÆT KONTAKT FORMULAR HER TIL BOOKING</h3>
              </div>
            </article>
          </section>
        </main>
      </Layout>
    </>
  );
}
