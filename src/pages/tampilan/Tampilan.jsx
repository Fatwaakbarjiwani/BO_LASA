import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getPageImage } from "../../redux/actions/authAction";

export default function Tampilan() {
  const dispatch = useDispatch();
  // const { pageImage } = useSelector((state) => state.page);
  useEffect(() => {
    dispatch(getPageImage());
  }, [dispatch]);
  return (
    <div>
      {/* <div>{pageImage}</div> */}
    </div>
  );
}
