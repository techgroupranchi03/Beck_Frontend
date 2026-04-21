import React, { useState } from "react";
import { Typography, Button } from "@mui/material";

const ViewMoreText = ({ text, limit = 60 }) => {
    const [expanded, setExpanded] = useState(false);

    const isLong = text?.length > limit;
    const displayText = expanded ? text : text?.slice(0, limit);

    return (
        <Typography variant="body2" color="text.secondary" sx={{textTransform : "capitalize"}}>
            {displayText}

            {/* Show dots only when collapsed */}
            {!expanded && isLong && "... "}

            {isLong && (
                <Button
                    component="span"
                    onClick={() => setExpanded(!expanded)}
                    size="small"
                    variant="text"
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        textTransform: "none",
                        fontSize: "12px",
                        display: "inline-flex",
                        verticalAlign: "baseline",
                        color: "primary.main",
                    }}
                >
                    {expanded ? "View Less" : "View More"}
                </Button>
            )}
        </Typography>
    );
};

export default ViewMoreText;
