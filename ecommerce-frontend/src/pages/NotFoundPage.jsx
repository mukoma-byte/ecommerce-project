import { Header } from '../components/Header';
import './NotFoundPage.css'

export function NotFoundPage(){
  return (
    <div className='container'>
    <Header></Header>
    <div className="not-found-message">
      Page Not Found!
    </div>
    </div>
  );
}