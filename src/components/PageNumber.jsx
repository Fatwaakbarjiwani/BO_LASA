import { Pagination } from "@mui/material";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

export default function PageNumber({ total, page, setPage }) {
  const dispatch = useDispatch();
  const handleButton = (event, value) => {
    event.preventDefault();
    dispatch(setPage(value));
  };

  return (
    <>
      {total > 1 && (
        <Pagination
          count={total}
          variant="outlined"
          shape="rounded"
          page={page}
          onChange={handleButton}
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          sx={{
            "& .MuiPaginationItem-root": {
              color: "green",
              borderColor: "green",
            },
            "& .MuiPaginationItem-ellipsis": {
              color: "gray",
            },
            "& .Mui-selected": {
              backgroundColor: "#69C53E !important",
              color: "white",
            },
          }}
        />
      )}
    </>
  );
}

PageNumber.propTypes = {
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
};
