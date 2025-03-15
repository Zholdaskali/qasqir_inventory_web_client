
import notFoundIllustr from '../../assets/illustrations/not-found.svg'

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen flex-col">
            <img src={notFoundIllustr} alt="" className='w-1/3' />
            <h1 className='text-2xl text-main-dull-blue uppercase font-medium'>Страница не найдена</h1>
        </div>
    );
}

export default NotFound;
