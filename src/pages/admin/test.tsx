import { LayoutAdmin } from '@/Layout_Admin';
import { createClient } from '@supabase/supabase-js';

import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input2 } from '@/components/ui/input';
import { Input } from '@/components/Inputfields/Inputfield';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Secondary } from '@/components/Button/Button.stories';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export async function getServerSideProps() {
  const { data: sponsors, error } = await supabase.storage.from('sponsorer').list('', {
    sortBy: { column: 'name', order: 'asc' },
  });
  if (!sponsors) {
    console.log(error);
  }
  return { props: { sponsors } };
}

interface Sponsor {
  src: string;
  name: string;
}

interface fileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface ComboSpons {
  value: string;
  label: string;
}

export default function test({ sponsors }: { sponsors: fileObject[] }) {
  const [file, setFile] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<any>();
  const [sponsorName, setSponsorName] = useState<string>();
  const [selectSponsor, setSelectSponsor] = useState<string>();
  const [sponsorList, setSponsorList] = useState<Sponsor[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [comboValue, setComboValue] = useState<string>();

  function handleInputImg(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
      console.log(e.target.files[0]);
      setFileDetails(e.target.files[0]);
    }
  }

  async function uploadImage() {
    const { data, error } = await supabase.storage.from('sponsorer').upload(`${sponsorName}${fileDetails.name.substring(fileDetails.name.lastIndexOf('.'))}`, fileDetails);
    console.log(data);
    console.log(error);
  }

  async function addSponsorToList() {
    const { data } = supabase.storage.from('sponsorer').getPublicUrl(`${selectSponsor}`);
    if (!data) {
      console.log('error in url');
      return;
    }
    console.log(data);
    const sponsName: string = selectSponsor?.substring(0, selectSponsor.lastIndexOf('.')).replaceAll(/_/g, ' ') as string;
    const sponsorObject: Sponsor = {
      src: data.publicUrl,
      name: sponsName,
    };
    setSponsorList((prevList) => [...prevList, sponsorObject]);
  }

  // COMMENT OUT FROM HERE TO DISABLE LOGIN GUARD
  const router = useRouter();

  useEffect(() => {
    getSession();
  }, []);

  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (data.session === null) {
      router.push('/login');
    }
  }

  const comboSponsor: ComboSpons[] = sponsors.map((item: fileObject) => ({
    value: item.name,
    label: item.name.substring(0, item.name.lastIndexOf('.')).replaceAll(/_/g, ' '),
  }));
  // COMMENT OUT TO HERE TO DISABLE LOGIN GUARD

  return (
    <>
      <LayoutAdmin>
        <main className='spacer'>
          <h1 className='mt-20' onClick={() => console.log(fileDetails)}>
            {' '}
            TEST site - For storage upload{' '}
          </h1>
          <button className='border border-white p2' onClick={() => console.log(sponsors)}>
            Sponsors
          </button>
          <button className='border border-white p2' onClick={() => console.log(selectSponsor)}>
            selectValue
          </button>
          <div className='flex flex-row items-center gap-2'>
            {/* <Select onValueChange={(e) => setSelectSponsor(e)}>
              <SelectTrigger className='w-fit'>
                <SelectValue placeholder='Vælg ekisterende sponsor' />
              </SelectTrigger>
              <SelectContent>
                {sponsors.map((image: any) => (
                  <SelectItem value={image.name}>{image.name.substring(0, image.name.lastIndexOf('.')).replaceAll(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant='ghost' role='combobox' aria-expanded={open} className='w-[200px] justify-between border-b-2 border-white'>
                  {comboValue ? comboSponsor.find((sponsor: any) => sponsor.value === comboValue)?.label : 'Vælg sponsor...'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[200px] p-0'>
                <Command>
                  <CommandInput placeholder='Find sponsor...' />
                  <CommandEmpty>Ingen sponsorer fundet.</CommandEmpty>
                  <CommandGroup>
                    {comboSponsor.map((sponsor: any) => (
                      <CommandItem
                        key={sponsor.value}
                        value={sponsor.value}
                        onSelect={(currentValue) => {
                          setComboValue(currentValue === comboValue ? '' : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', comboValue === sponsor.value ? 'opacity-100' : 'opacity-0')} />
                        {sponsor.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {selectSponsor ? (
              <Button className='max-w-fit mt-0' variant='secondary' onClick={() => addSponsorToList()}>
                Tilføj sponsor
              </Button>
            ) : (
              <Button className='max-w-fit mt-0' variant='secondary' onClick={() => addSponsorToList()} disabled>
                Tilføj sponsor
              </Button>
            )}
          </div>
          <div>
            <h4>Sponsor liste</h4>
            {sponsorList.length < 1 ? (
              <p>Ingen sponsorer tilføjet</p>
            ) : (
              <article className='sponsorCards'>
                {sponsorList.map((sponsor) => (
                  <figure>
                    <img src={sponsor.src} alt='Sponsor image' className='w-full' />
                    <figcaption>{sponsor.name}</figcaption>
                  </figure>
                ))}
              </article>
            )}
          </div>
          <div className='flex flex-col gap-0.5 mt-6'>
            <Label htmlFor='sponsImg'>Upload Sponsor Logo</Label>
            <Input2 id='sponsImg' type='file' onChange={handleInputImg} />
          </div>
          <div className='flex flex-col gap-0.5 mt-6'>
            <Label htmlFor='sponsName'>Sponsor navn</Label>
            <Input id='sponsName' type='text' value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} />
          </div>
          {file && (
            <>
              {/* {sponsorName ? <Label>{sponsorName}</Label> : <Label> Sponsor Billede Preview</Label>} */}
              <img src={file} alt='Uploaded file' width='150' height='auto' />
            </>
          )}
          <button onClick={() => uploadImage()}>Upload to Supabase </button>
        </main>
      </LayoutAdmin>
    </>
  );
}
