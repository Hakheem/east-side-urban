import Loader from 'react-loaders';
import './index.scss';

const CustomLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <div className="loader loader-active">
        <Loader type="ball-scale-multiple" active />
      </div>
    </div>
  );
};

export default CustomLoader;
