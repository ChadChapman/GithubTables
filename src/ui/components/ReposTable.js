import React from "react";
import styled from "@emotion/styled";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableWrapper = styled("div")`
  min-width: 720px;
  width: 100%;
`;

export default function ReposTable(props) {
    const { colHeaders, records } = props;
    return (
        <StyledTableWrapper>
            <TableContainer component={Paper}>
                <Table aria-label="repos table">
                    <TableHead>
                        <TableRow>
                            {colHeaders.map((eachColHeader, idx) => (
                                <TableCell key={idx}>{eachColHeader}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell component="th" scope="row">
                                    {record.id}
                                </TableCell>
                                <TableCell align="left">{record.name}</TableCell>
                                <TableCell align="left">{record.description || '[no description found]'}</TableCell>
                                <TableCell align="left">{record.stargazers_count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledTableWrapper>
    );
}