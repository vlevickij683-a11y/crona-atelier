import {afterEach,describe,it,expect,vi} from 'vitest';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import ImageField from './ImageField';
import {useEditor} from './useEditor';
import {EDITOR_KEY} from './model';
import {ImageFailure,prepareImage,storeImage} from './images';
vi.mock('./images',async importOriginal=>{
 const actual=await importOriginal<typeof import('./images')>();
 return {...actual,prepareImage:vi.fn(actual.prepareImage),storeImage:vi.fn(async()=>{}),getImage:vi.fn(async()=>undefined)};
});
afterEach(()=>vi.unstubAllGlobals());
function Fixture(){const editor=useEditor();return <ImageField product={editor.doc.products[0]} editor={editor} locale="en"/>;}
describe('local image editing',()=>{
 it('rejects unsupported or oversized files before decoding',async()=>{
  await expect(prepareImage(new File(['<svg/>'],'x.svg',{type:'image/svg+xml'}))).rejects.toMatchObject({code:'imageType'});
  const big=new File([new Uint8Array(8*1024*1024+1)],'big.png',{type:'image/png'});
  await expect(prepareImage(big)).rejects.toMatchObject({code:'imageSize'});
 });
 it('handles a dropped file through the same persistence path and restores the original',async()=>{
  vi.mocked(prepareImage).mockResolvedValueOnce(new Blob(['test'],{type:'image/webp'}));
  vi.stubGlobal('URL',Object.assign(class extends URL {},{createObjectURL:vi.fn(()=> 'blob:test'),revokeObjectURL:vi.fn()}));
  render(<Fixture/>);
  fireEvent.drop(screen.getByText('Drop an image here').parentElement!,{dataTransfer:{files:[new File(['test'],'test.png',{type:'image/png'})]}});
  await waitFor(()=>expect(screen.getByRole('img').getAttribute('src')).toBe('blob:test'));
  expect(storeImage).toHaveBeenCalled();
  // The preview commits before React's persistence effect; wait for the saved document too.
  await waitFor(()=>expect(JSON.parse(localStorage.getItem(EDITOR_KEY)??'null')?.products[0].image).toMatch(/^upload:/));
  fireEvent.click(screen.getByRole('button',{name:'Restore original image'}));
  expect(screen.getByRole('img').getAttribute('src')).toBe('/products/watch.webp');
 });
 it('keeps the previous image when IndexedDB refuses the upload',async()=>{
  vi.mocked(prepareImage).mockResolvedValueOnce(new Blob(['test'],{type:'image/webp'}));
  vi.mocked(storeImage).mockRejectedValueOnce(new ImageFailure('imageStore'));
  render(<Fixture/>);
  fireEvent.change(screen.getByLabelText('Choose image'),{target:{files:[new File(['test'],'test.png',{type:'image/png'})]}});
  await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('previous image is unchanged'));
  expect(screen.getByRole('img').getAttribute('src')).toBe('/products/watch.webp');
  expect(localStorage.getItem(EDITOR_KEY)).toBeNull();
 });
});
