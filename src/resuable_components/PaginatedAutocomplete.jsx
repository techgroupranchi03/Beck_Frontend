import React, { useState, useRef, useCallback, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";

const PaginatedAutocomplete = ({
  label,
  value,
  options,
  getOptionLabel,
  onChange,
  fetchData,
  pagination,
  error,
  helperText,
}) => {

  const [searchText, setSearchText] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimer = useRef(null);

  const handleSearch = useCallback((event, value, reason) => {

    if (reason === "input") {

      setSearchText(value);

      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }

      searchTimer.current = setTimeout(() => {
        fetchData(1, false, value);
      }, 400);

    }

    if (reason === "clear") {
      setSearchText("");
      fetchData(1, false, "");
    }

  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      getOptionLabel={getOptionLabel}
      onInputChange={handleSearch}
      filterOptions={(x) => x}
      loading={loadingMore}
      onChange={onChange}

      ListboxProps={{
        onScroll: async (event) => {

          const listboxNode = event.currentTarget;

          if (
            listboxNode.scrollHeight - listboxNode.scrollTop - listboxNode.clientHeight <= 10 &&
            pagination?.hasNextPage &&
            !loadingMore
          ) {

            setLoadingMore(true);

            try {

              await fetchData(
                (pagination.page || 1) + 1,
                true,
                searchText
              );

            } catch (err) {
              console.error("Pagination error:", err);
            } finally {
              setLoadingMore(false);
            }
          }
        }
      }}

      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
        />
      )}

      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default PaginatedAutocomplete;