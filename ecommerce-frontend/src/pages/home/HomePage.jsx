import axios from 'axios'
import { ProductGrid } from './ProductGrid';
import { useEffect, useState } from 'react';
import { Header } from "../../components/Header";
<<<<<<< HEAD
import { useSearchParams } from 'react-router';
=======
import { useSearchParams } from "react-router-dom";

>>>>>>> cccf6bf20d87a1e1fdd9bd0b9bc60db31664a12b
import "./HomePage.css";


export function HomePage({ cart, loadCart }) {
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

      <Header cart={cart} />

      <div className="home-page">
        <ProductGrid products={products} loadCart={loadCart} />
      </div>
    </>
  );
}
