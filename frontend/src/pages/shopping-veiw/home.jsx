import { Button } from '@/components/ui/button'
import images from '@/assets/assets'

const Home = () => {

  const slides = [
images.header_img, images.heroBg, 
  ]

  return (
    <div className='padded flex flex-col min-h-screen ' >
      <div className="relative w-full h-[600px] overflow-hidden ">
        {
slides.map((slide, index)=> <img
src={slide}
key={index}
className={"w-full h-full object-cover object-center absolute top-0 left-0 transition-opacity duration-1000 "}
/> )
        }
        <Button>

        </Button>
      </div>
      </div>
  )
}

export default Home