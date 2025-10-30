import axios from 'axios'
import { ProductGrid } from './ProductGrid';
import { useEffect, useState } from 'react';
import { Header } from "../../components/Header";
import { useSearchParams } from 'react-router';
import "./HomePage.css";


export function HomePage({ user, cart, loadCart, setUser, setCart }) {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('searchText');

  useEffect(() => {
   const getHomeData = async () => {
   const urlPath = search ? `/api/products?search=${search}` : "/api/products";
   const response = await axios.get(urlPath);
   setProducts(response.data)
   }

   getHomeData();
  }, [search]);

  return (
    <>
      <link rel="icon" type="image/svg+xml" href="images/home-favicon.png" />
      <title>Home Page</title>

      <Header user={user} cart={cart} setCart={setCart} setUser={setUser} />

      <div className="home-page">
        <ProductGrid products={products} loadCart={loadCart} />
      </div>
    </>
  );
}
