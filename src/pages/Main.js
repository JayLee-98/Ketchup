import { Link, useNavigate } from "react-router-dom";
import BootstrapTable from "../components/contents/BootstrapTable";
import ApprovalBox from "../components/contents/ApprovalBox";
import { useDispatch, useSelector } from "react-redux";
import { decodeJwt } from '../utils/tokenUtils';
import { useEffect, useState } from "react";
import { callGetMemberNameAPI } from "../apis/MemberAPICalls";
import { callGetNoticeListAPI } from "../apis/NoticeAPICalls";
import { getScheduleAPI } from "../apis/ScheduleAPICalls";
import { callGetApprovalCountAPI } from "../apis/ApprovalAPICalls";
import FormatDateTime from "../components/contents/FormatDateTime";
import { BsMegaphone } from "react-icons/bs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from '@fullcalendar/list';
import moment from "moment";

function Main() {
    const dispatch = useDispatch();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태를 관리합니다.
    const schedules = useSelector(state => state.scheduleReducer);
    const navigate = useNavigate();
    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
    console.log('[ loginToken ] : ', loginToken);
    const [approvalCount, setApprovalCount] = useState({});

    // 결재 
    const approvalData = [
        { title: "진행중인 문서", count: approvalCount?.myApp, categoryNo: 1},
        { title: "완료된 문서", count: approvalCount?.doneApp, categoryNo: 2},
        { title: "결재 대기 문서", count: approvalCount?.receiveApp, categoryNo: 3},
        { title: "수신 참조 문서", count: approvalCount?.refApp, categoryNo: 4}
    ];

    const convertToCalendarProps = (schedules) => {
        try {
            if (schedules && schedules.results && schedules.results.schedule) {
                const events = schedules.results.schedule.map(schedule => ({
                    title: schedule.skdName,
                    start: moment(schedule.skdStartDttm, "YYYY-MM-DD A h:mm").toISOString(),
                    end: moment(schedule.skdEndDttm, "YYYY-MM-DD A h:mm").toISOString(),
                    id: schedule.skdNo,
                    extendedProps: {
                        skdLocation: schedule.skdLocation,
                        skdMemo: schedule.skdMemo
                    }
                }));
                return events;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    };

    useEffect(() => {
        dispatch(callGetNoticeListAPI());

        const fetchSchedules = () => {
            try {
                const token = decodeJwt(window.localStorage.getItem("accessToken"));
                const dptNo = token.depNo;

                if (dptNo) {
                    dispatch(getScheduleAPI(dptNo));
                }
            } catch (error) {
                console.error("fetchSchedules 도중 에러 발생", error);
            }
        };
        const categoryCount = async () => {
            try {
                const result = await callGetApprovalCountAPI(loginToken.memberNo);
                if (result.status === 200) {
                    setApprovalCount(result.data);
                } else {
                    console.log('실패');
                }
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
            }
        };
        categoryCount();
        fetchSchedules();
    }, [dispatch]);

    useEffect(() => {
        if (!schedules) {
            return;
        }
        setEvents(convertToCalendarProps(schedules));
        setIsLoading(false); 
    }, [schedules]);

    // 공지사항 목록 Redux store에서 가져오기
    const noticeList = useSelector(state => state.noticeReducer.noticelist);

    const formattedNoticeList = noticeList ? noticeList
        .sort((a, b) => new Date(b.noticeCreateDttm) - new Date(a.noticeCreateDttm)) // 등록일 기준으로 내림차순 정렬
        .slice(0, 3) // 최신 3개의 공지만 표시
        .map(item => ({
            ...item,
            noticeTitle: (
                <>
                    {item.noticeFix === 'Y' && ( // 필독 공지인 경우에만 [ 필독 ]을 붙임
                        <span style={{ marginRight: '5px' }}>
                            [ 필독&nbsp;
                            <span style={{ color: '#EC0B0B' }}>
                                <BsMegaphone />
                            </span>
                            &nbsp;]
                        </span>
                    )}
                    {item.noticeTitle}
                </>
            ),
            noticeCreateDttm: FormatDateTime(item.noticeCreateDttm)
        })) : [];

    // 컬럼 제목 목록
    const columns = [
        ['noticeNo', '공지번호'],
        ['noticeTitle', '제목'],
        ['memberName', '작성자'],
        ['noticeCreateDttm', '등록일']
    ];

    const handleRowClick = (index) => {
        // 클릭된 행의 noticeNo를 가져와서 상세 페이지로 이동합니다.
        const noticeNo = noticeList[index]?.noticeNo;

        console.log('handleRowClick [ noticeNo ] : ', noticeNo);

        navigate(`/notices/${noticeNo}`);
    };

    //   const jwt = require('jsonwebtoken');
    //   const decodedToken = jwt.decode(token);
    //   const memberNo = decodedToken.memberNo;
    //     console.log('memberNo: ', memberNo);
    //     const memberName = decodedToken.memberName;
    //     console.log('memberName: ', memberName);

    return (
        <main id="main" className="main">
            {isLoading ? ( // 데이터 로딩 중이면 로딩 스피너를 표시합니다.
                <div>Loading...</div>
            ) : (
                <>
                    {/* 메인 환영 */}
                    <div className="pagetitle">
                        <div id="mainbox" className="p-4 p-md-5 mb-4 rounded text-body-emphasis" style={{ backgroundColor: "rgb(236, 11, 11, 0.17)" }}>
                            <div className="col-lg-6 px-0">
                                <h1 className="display-1" style={{ fontSize: "45px" }}>안녕하세요, {loginToken.memberName} 사원님!</h1>
                                <h2 className="lead my-3" style={{ fontSize: "30px" }}>오늘 하루도 화이팅하세요🤩</h2>
                            </div>
                        </div>
                    </div>

                    {/* 전자결재 */}
                    <div className="col-lg-12">
                        <div className="row">
                            {approvalData.map(({ title, count }) => (
                                <ApprovalBox title={title} count={count} />
                            ))}
                        </div>
                    </div>

                    {/* 공지사항 */}
                    <div className="col-12">
                        <div className="card recent-sales overflow-auto">
                            <h2 className="card-title"
                                style={{ fontWeight: 'bold', fontSize: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
                                공지사항
                                <Link to={`/notices`} style={{ fontSize: '18px', color: '#EC0B0B' }}>
                                    더보기
                                </Link>
                            </h2>
                            <BootstrapTable data={formattedNoticeList} columns={columns} onRowClick={handleRowClick} />
                        </div>
                    </div>

                    {/* 일정 */}
                    <div className="col-12">
                        <FullCalendar
                            events={events}
                            height="50vh"
                            initialView="dayGridWeek"
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                interactionPlugin,
                                listPlugin
                            ]}
                            headerToolbar={{
                                left: "prev title next today",
                                center: "",
                                right: "moreButton"
                            }}
                            customButtons={{
                                moreButton: {
                                    text: '더보기',
                                    click: function () { alert("더보기 버튼이 정상적으로 클릭되었습니다. '일정' 페이지로 이동시킬 예정입니다."); }
                                }
                            }}
                        />
                    </div>
                </>
            )}
        </main >
    );
}

export default Main;
