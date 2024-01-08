import { LayoutAdmin } from '@/Layout_Admin';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input2 } from '@/components/ui/input';
import { Input } from '@/components/Inputfields/Inputfield';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { ImSpinner10 } from 'react-icons/im';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useForm } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid'; // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
import * as z from 'zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MdError } from 'react-icons/md';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { useAtom } from 'jotai';
import { sponsorsAtom } from '@/states/store';

export async function fetchSponsors() {
  const { data: sponsors, error } = await supabase.storage.from('sponsorer').list('', {
    sortBy: { column: 'name', order: 'asc' },
  });
  if (sponsors) {
    const sponsors1 = sponsors.filter(obj => obj.name !== '.emptyFolderPlaceholder');
    return { props: { sponsors1 } };
  }
}

export interface Sponsor {
  src: string;
  name: string;
}

export interface fileObject {
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

export default function Test({ sponsors1 }: { sponsors1: fileObject[] }) {
  const [file, setFile] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<any>('');
  const [sponsorName, setSponsorName] = useState<string>('');
  const [selectSponsor, setSelectSponsor] = useState<string>('');
  const [sponsorList, setSponsorList] = useAtom(sponsorsAtom);

  const [open, setOpen] = useState<boolean>(false);
  const [open2, setOpen2] = useState<boolean>(false);
  const [comboValue, setComboValue] = useState<string>('');
  const [loader, setLoader] = useState<boolean>(false);
  const [isUploadValid, setIsUploadValid] = useState<boolean>(false);
  const [sponsorForm, setSponsorForm] = useState({ src: '', navn: '' });
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

  // COMMENT OUT TO HERE TO DISABLE LOGIN GUARD

  const handleSponsorSubmit = (e: any) => {
    e.preventDefault();
    uploadImage();
  };

  const comboSponsor: ComboSpons[] =
    sponsors1 &&
    sponsors1.map((item: fileObject) => ({
      value: item.name,
      label: item.name.substring(0, item.name.lastIndexOf('.')).replaceAll(/_/g, ' '),
    }));

  function handleInputImg(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setFile(URL.createObjectURL(e.target.files[0]));
      setFileDetails(e.target.files[0]);
    }
  }

  async function uploadImage() {
    const { data, error } = await supabase.storage
      .from('sponsorer')
      .upload(
        `${sponsorName?.replaceAll(' ', '_')}${fileDetails.name.substring(
          fileDetails.name.lastIndexOf('.')
        )}`,
        fileDetails
      );
    addNewSponsorToList();
  }

  async function addNewSponsorToList() {
    const { data } = supabase.storage
      .from('sponsorer')
      .getPublicUrl(
        `${sponsorName?.replaceAll(' ', '_')}${fileDetails.name.substring(
          fileDetails.name.lastIndexOf('.')
        )}`
      );
    if (!data) {
      return;
    }
    const sponsName: string = sponsorName as string;
    const sponsorObject: Sponsor = {
      src: data.publicUrl,
      name: sponsName,
    };
    setSponsorList(prevList => [...prevList, sponsorObject]);
    setSponsorName('');
    setFileDetails('');
    setFile('');
    setOpen2(false);
  }

  async function addSponsorToList() {
    const { data } = supabase.storage.from('sponsorer').getPublicUrl(`${comboValue}`);
    if (!data) {
      console.log('error in url');
      return;
    }
    const includesURL = sponsorList.some(sponsor => {
      // Check if any property in the object includes the searchString
      return Object.values(sponsor).some(
        src => typeof src === 'string' && src.includes(data.publicUrl)
      );
    });
    if (!includesURL) {
      const sponsName: string = comboValue
        ?.substring(0, comboValue.lastIndexOf('.'))
        .replaceAll(/_/g, ' ') as string;
      const sponsorObject: Sponsor = {
        src: data.publicUrl,
        name: sponsName,
      };
      setSponsorList(prevList => [...prevList, sponsorObject]);
    }
    setComboValue('');
  }

  return (
    <>
      <p className='mb-6 leading-6'>
        Findes sponsor ikke på listen?{' '}
        <span
          className='block text-accentCol font-semibold cursor-pointer'
          onClick={() => setOpen2(true)}
        >
          Tilføj ny sponsor ved at klikke her
        </span>
      </p>
      <div>
        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              role='combobox'
              aria-expanded={open}
              className='w-[200px] justify-between border-b-2 border-white'
            >
              {comboValue
                ? comboSponsor.find((sponsor: any) => sponsor.value === comboValue)?.label
                : 'Vælg sponsor...'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[200px] p-0'>
            <Command>
              <CommandInput placeholder='Find sponsor...' />
              <CommandEmpty>Ingen sponsorer fundet.</CommandEmpty>
              <CommandGroup>
                {comboSponsor &&
                  comboSponsor.map((sponsor: any) => (
                    <CommandItem
                      key={sponsor.value}
                      value={sponsor.value}
                      onSelect={currentValue => {
                        console.log(currentValue);
                        setComboValue(
                          currentValue === comboValue?.toLowerCase() ? '' : sponsor.value
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 text-white',
                          comboValue === sponsor.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {sponsor.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {comboValue ? (
          <Button
            className='max-w-fit mt-0'
            variant='secondary'
            onClick={() => addSponsorToList()}
          >
            Tilføj sponsor
          </Button>
        ) : (
          <Button
            className='max-w-fit mt-0 text-black'
            variant='secondary'
            onClick={() => addSponsorToList()}
            disabled
          >
            Tilføj sponsor
          </Button>
        )}
      </div>
      <div>
        {sponsorList.length > 0 ? (
          <>
            <h4>Sponsor liste</h4>
            <article className='sponsorCards'>
              {sponsorList.map(sponsor => (
                <figure
                  key={uuidv4()}
                  className='bg-white bg-opacity-30 px-3 py-2 flex flex-col justify-center'
                >
                  <img
                    src={sponsor.src}
                    alt={`Sponsor image for ${sponsor.name}.`}
                    className='w-full'
                  />
                  <figcaption className='inline-block font-semibold text-accentCol text-center mt-2 sponsCaption'>
                    {sponsor.name}
                  </figcaption>
                </figure>
              ))}
            </article>{' '}
          </>
        ) : (
          ''
        )}
      </div>
      <Dialog
        open={open2}
        onOpenChange={setOpen2}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Tilføj Sponsor</DialogTitle>
            <DialogDescription>
              Upload et billede og tilføj et navn til den nye sponsor. Denne tilføjes til listen
              over nuværende sponsorer og gemmes til brug for fremtidige events
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSponsorSubmit}>
            <div className='flex flex-col gap-0.5 mt-6'>
              <Label htmlFor='sponsImg'>Upload Sponsor Logo</Label>
              <Input2
                id='sponsImg'
                type='file'
                onChange={handleInputImg}
              />
            </div>
            <div className='flex flex-col gap-0.5 mt-6 mb-6'>
              <Label htmlFor='sponsName'>Sponsor navn</Label>
              <Input
                id='sponsName'
                type='text'
                value={sponsorName}
                onChange={e => setSponsorName(e.target.value)}
              />
            </div>
            {file && (
              <>
                <Label> Sponsor Billede Preview</Label>
                <img
                  src={file}
                  alt='Uploaded file'
                  style={{ width: '150px', height: 'auto' }}
                />
              </>
            )}
            <DialogFooter>
              <Button>Gem og tilføj sponsor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
