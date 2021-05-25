import React, {useState, useEffect} from "react";
import styled from "@emotion/styled";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';

const StyledTableWrapper = styled("div")`
  min-width: 720px;
  width: 100%
`;

export default function UsersTable(props) {
    const { colHeaders, records, counts } = props;
    const [tableRecords, setTableRecords] = useState([])
    const [followersCount, setFollowersCount] = useState({})

    useEffect(() => {
        setTableRecords(records);
    }, [records])

    useEffect(() => {
        setFollowersCount(counts)
    }, [counts])

    return (
        <StyledTableWrapper>
            <TableContainer component={Paper}>
                <Table aria-label="users table">
                    <TableHead>
                        <TableRow>
                            {colHeaders.map((eachColHeader, idx) => (
                                <TableCell key={idx}>{eachColHeader}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRecords.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell component="th" scope="row">
                                    {record.id}
                                </TableCell>
                                <TableCell align="left">{record.login}</TableCell>
                                <TableCell align="left"><Avatar src={record.avatar_url}/></TableCell>
                                <TableCell align="left">{followersCount[record.login] || 'counting followers...'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledTableWrapper>
    );
}