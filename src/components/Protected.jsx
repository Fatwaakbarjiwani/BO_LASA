import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "../redux/actions/authAction";

const Protected = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe(navigate, null, "/"));
  }, [dispatch, navigate]);

  return children;
};

export default Protected;
