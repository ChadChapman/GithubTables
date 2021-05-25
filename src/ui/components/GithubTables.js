import React, {useState, useEffect} from "react";
import styled from "@emotion/styled";
import {Button} from "@rebass/emotion";
import ReposTable from "./ReposTable";
import UsersTable from "./UsersTable";
import {Container} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';

const axios = require('axios');

const FetchRecordsButton = styled(Button)`
  background-color: #74b49b;
  cursor: pointer;
`;

// from repo records we want this attribute set: {id, name, description, star count}
const repoFiltersObj = {
    'id': 'Id',
    'name': 'Name',
    'description': 'Description',
    'stargazers_count': 'Stars'
}

// from user records we want this attribute set: {id, login, avatar, follower count}
const userFiltersObj = {
    'id': 'Id',
    'login': 'Name',
    'avatar_url': 'Avatar',
    'followers_url': 'Followers'
}

const axiosInstance = axios.create({
    baseURL: 'https://api.github.com/',
    timeout: 60000,
    headers: {'Accept': 'application/vnd.github.v3+json'}
})

const oneMinuteAsMS = 1000 * 60;
const twoMinutesAsMS = oneMinuteAsMS * 2;

const useStyles = makeStyles({
    tableHeader: {
        margin: 15
    },
    tableWrapper: {
        display: "flex",
        margin: 20
    },
    table: {
        marginTop: 16,
        marginBottom: 8
    },
    fetchButton: {
        marginTop: 8,
        marginBottom: 8
    },
    dividerDiv: {
        minHeight: 16,
        background: 'rgba(116, 180, 155, 0.4)'
    }
});

export default function GithubTables() {
    const classes = useStyles();

    const [repoTableRecords, setRepoTableRecords] = useState([])
    const [userTableRecords, setUserTableRecords] = useState([])
    const [followersCount, setFollowersCount] = useState({})

    const queryDateParam = (recordsType) => {
        let queryDate = new Date();
        const queryYear = recordsType === 'repos' ? queryDate.getFullYear() : queryDate.getFullYear() - 1;
        let queryMonth = recordsType === 'repos' ? queryDate.getMonth() - 1 : queryDate.getMonth();
        if (queryMonth < 10) {
            queryMonth = `0${queryMonth.toString()}`
        }
        let queryDay = queryDate.getDate();
        if (queryDay < 10) {
            queryDay = `0${queryDay.toString()}`
        }
        const queryDateParam = `${queryYear}-${queryMonth}-${queryDay}`;
        return queryDateParam;
    }

    const handleRepoRecordsFetch = (async () => {
        // display an noti telling the user they have to wait to make their request?
        // todo - check for return of > 60 requests / hour - 5xx? 403?
        const urlQueryDateParam = queryDateParam('repos');
        const topReposURL = `search/repositories?q=created:${urlQueryDateParam}&sort=stars&order=desc&page=1&per_page=5`;
        try {
            const apiResponse = await axiosInstance.get(topReposURL)
            const responseRecords = apiResponse?.data?.items;
            await buildRecordsSetState(responseRecords, 'repos');
        } catch (e) {
            console.error(e);
            // notify the user there was an error?
        }
    })

    const handleUserRecordsFetch = (async () => {
        const urlQueryDateParam = queryDateParam('users');
        const topUsersURL = `search/users?q=created:${urlQueryDateParam}&sort=followers&order=desc&page=1&per_page=5`;
        try {
            const apiResponse = await axiosInstance.get(topUsersURL)
            const responseRecords = apiResponse?.data?.items;
            await buildRecordsSetState(responseRecords, 'users');
        } catch (e) {
            console.error(e);
            // notify the user there was an error?
        }
    })

    useEffect(() => {
        async function fetchData() {
            await handleRepoRecordsFetch();
            await handleUserRecordsFetch();
        }
        fetchData()
    }, []);

    const buildRecordsSetState = async (recordsArr, recordsType) => {
        const filterKeys = recordsType === 'repos' ? Object.keys(repoFiltersObj) : Object.keys(userFiltersObj);
        const updatedRecordsArr = recordsArr.map((eachRecord) => {
            const updatedRecord = {};
            filterKeys.forEach((filterKey) => {
                updatedRecord[filterKey] = eachRecord[filterKey];
            })
            return updatedRecord
        })
        if (recordsType === 'repos') {
            setRepoTableRecords(updatedRecordsArr)
        } else {
            try {
                setUserTableRecords(updatedRecordsArr)
                await fetchFollowersCount(updatedRecordsArr)
            } catch (e) {
                setUserTableRecords(updatedRecordsArr)
                console.error(e)
            }
        }
    }

    async function fetchFollowersCount(updatedRecordsArr) {
        const promisesArr = []
        updatedRecordsArr.forEach((eachRecord) => {
            const queryPath = `users/${eachRecord.login}/followers`;
            const followersPromise = axiosInstance.get(queryPath);
            promisesArr.push(followersPromise)
        })
        Promise.all(promisesArr)
            .then(function (results) {
                const countsObj = {}
                results.forEach((eachResult) => {
                    const followersCount = eachResult.data.length;
                    const resultRequestUrl = eachResult.config.url
                    const resultUserLogin = resultRequestUrl.split('/')[1];
                    countsObj[resultUserLogin] = followersCount
                })
                return countsObj;
            }).then(function (counts) {
            setFollowersCount(counts)
        }).catch((err) => {
            setUserTableRecords(updatedRecordsArr)
            console.error(err)
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            console.warn(new Date())
            fetchFollowersCount(userTableRecords)
                .then(() => console.log('updated followers'))
                .catch(err => console.error(err))
        }, twoMinutesAsMS)
        return () => clearInterval(interval)
    }, []);

    return (
        <>
            <h2 className={classes.tableHeader}>Github Tables</h2>
            <div className={classes.dividerDiv}></div>
            <div className={classes.tableWrapper}>
                <Container maxWidth={'lg'}>
                    <div className={classes.table}>
                        <ReposTable
                            colHeaders={Object.values(repoFiltersObj)}
                            records={repoTableRecords}
                        />
                        <div className={classes.fetchButton}>
                            <FetchRecordsButton
                                id={"hot_repo"}
                                onClick={async () => {
                                    await handleRepoRecordsFetch()
                                }}
                            >
                                Fetch Repo Records
                            </FetchRecordsButton>
                        </div>

                    </div>
                    <div className={classes.dividerDiv}></div>
                    <div className={classes.table}>
                        <UsersTable
                            colHeaders={Object.values(userFiltersObj)}
                            records={userTableRecords}
                            counts={followersCount}
                        />
                        <div className={classes.fetchButton}>
                            <FetchRecordsButton
                                id={"prolific_users"}
                                onClick={async () => {
                                    await handleUserRecordsFetch()
                                }}
                            >
                                Fetch User Records
                            </FetchRecordsButton>
                        </div>
                    </div>
                    <div className={classes.dividerDiv}></div>
                </Container>
            </div>


        </>
    );
}