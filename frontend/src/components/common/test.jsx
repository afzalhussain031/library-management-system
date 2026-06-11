import { useLocation } from "react-router-dom";

const test = () => {
  const location = useLocation();
  return (
    <>
      <p>Page :- {location.pathname}</p>
    </>
  )
}

export default test
