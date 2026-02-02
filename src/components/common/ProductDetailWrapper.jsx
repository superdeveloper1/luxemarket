import React from "react";
import Modal from "./Modal.jsx";
import ProductDetail from "../ProductDetail.jsx";

export default function ProductDetailWrapper({ currentUser, onOpenAuth, onCartUpdate }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [product, setProduct] = React.useState(null);

  React.useEffect(() => {
    const handleOpen = (e) => {
      const id = e.detail.productId;

      // Try to get the product from ProductManager first (since that's what's being displayed)
      if (window.ProductManager) {
        let product;
        if (window.ProductManager.getByIdAsync) {
          // For async, we'd need to handle this differently
          product = window.ProductManager.getById(id);
        } else {
          product = window.ProductManager.getById(id);
        }
        
        if (product) {
          setProduct(product);
          setIsOpen(true);
          return;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem("luxemarket_products");
      
      if (!stored) {
        return;
      }

      const products = JSON.parse(stored);
      const found = products.find((p) => p.id === id);

      if (found) {
        setProduct(found);
        setIsOpen(true);
      }
    };

    window.addEventListener("openProduct", handleOpen);
    return () => window.removeEventListener("openProduct", handleOpen);
  }, []);

  const close = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={close} maxWidth="max-w-2xl">
      {product && (
        <ProductDetail
          product={product}
          onClose={close}
          currentUser={currentUser}
          onOpenAuth={onOpenAuth}
          onCartUpdate={onCartUpdate}
        />
      )}
    </Modal>
  );
}