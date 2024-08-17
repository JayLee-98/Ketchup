import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from '@fullcalendar/list';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Box, Dialog, DialogTitle, Grid, Typography } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScheduleForm from "../../components/form/ScheduleForm";
import { getScheduleAPI, insertScheduleAPI, deleteScheduleAPI, updateScheduleAPI } from "../../apis/ScheduleAPICalls";
import moment from "moment";
import { decodeJwt } from "../../utils/tokenUtils";
import ScheduleDetail from "../../components/form/ScheduleDetail";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SubscriptionList from "../../components/lists/subscriptions/SubscriptionList";

const Calendar = () => {
    const scheduleStatuses = ["예정", "진행 중", "완료", "보류", "막힘"];
    const dispatch = useDispatch();
    const schedules = useSelector(state => state.scheduleReducer);
    const members = useSelector(state => state.memberReducer);
    const [calendarReady, setCalendarReady] = useState(false);
    const [newScheduleAdded, setNewScheduleAdded] = useState(false);
    const [insertScheduleDialogOpen, setInsertScheduleDialogOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [scheduleDetail, setScheduleDetail] = useState(null);
    const token = decodeJwt(window.localStorage.getItem("accessToken"));
    const dptNo = token?.depNo;
    const authorName = token?.memberName;
    const authorId = token?.memberNo;
    const [dateError, setDateError] = useState("");
    const [skdNameError, setSkdNameError] = useState("");
    const [touched, setTouched] = useState({
        skdName: false,
        skdStartDttm: false,
        skdEndDttm: false,
        skdLocation: false,
        skdMemo: false,
        participants: false,
        skdStatus: false
    });
    const [subscribedMembers, setSubscribedMembers] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(scheduleStatuses);

    useEffect(() => {
        const fetchSchedules = () => {
            dispatch(getScheduleAPI(dptNo));
            setCalendarReady(true);
        };
        fetchSchedules();
    }, [dispatch, newScheduleAdded]);

    const handleParticipantsChange = (event) => {
        const selectedValues = event.target.value;
        const selectedParticipants = selectedValues.map(value => {
            const member = members?.find(member => member?.memberNo === value);
            return { participantMemberNo: member?.memberNo, participantName: member?.memberName };
        });

        setNewScheduleData({
            ...newScheduleData,
            participants: selectedParticipants
        });
    };

    const [newScheduleData, setNewScheduleData] = useState({
        dptNo: dptNo,
        skdName: "",
        skdStartDttm: "",
        skdEndDttm: "",
        skdLocation: "",
        skdMemo: "",
        authorId: authorId,
        authorName: authorName,
        participants: [],
        skdStatus: "예정"
    });

    const [updatedScheduleData, setUpdatedScheduleData] = useState({
        participants: []
    });

    useEffect(() => {
        if (touched.skdName || touched.skdStartDttm || touched.skdEndDttm) {
            validateInsert();
        }
    }, [newScheduleData, touched]);

    const validateInsert = () => {
        const start = moment(newScheduleData.skdStartDttm);
        const end = moment(newScheduleData.skdEndDttm);

        let valid = true;

        if (!newScheduleData.skdName || newScheduleData.skdName.length < 5) {
            setSkdNameError("일정 이름은 공란일 수 없고 공백 포함 최소 5글자 이상이어야 합니다.");
            valid = false;
        } else {
            setSkdNameError("");
        }

        if (!newScheduleData.skdStartDttm || !newScheduleData.skdEndDttm) {
            setDateError("일정 시작 일시와 종료 일시를 모두 입력해주세요.");
            valid = false;
        } else if (start.isSameOrAfter(end)) {
            setDateError("일정 시작일시는 종료일시보다 이전이어야 합니다.");
            valid = false;
        } else {
            setDateError("");
        }

        return valid;
    };

    useEffect(() => {
        if (schedules.results && schedules.results.schedule) {
            setCalendarReady(true);
        }
    }, [schedules]);

    const onDateClickHandler = () => {
        setNewScheduleData({
            dptNo: dptNo,
            skdName: "",
            skdStartDttm: "",
            skdEndDttm: "",
            skdLocation: "",
            skdMemo: "",
            authorId: authorId,
            authorName: authorName,
            participants: [],
            skdStatus: "예정"
        });
        setInsertScheduleDialogOpen(true);
    };
    const onInsertCancelHandler = () => { setInsertScheduleDialogOpen(false); resetForm(); };
    const resetForm = () => {
        setNewScheduleData({
            dptNo: dptNo,
            skdName: "",
            skdStartDttm: "",
            skdEndDttm: "",
            skdLocation: "",
            skdMemo: "",
            authorId: authorId,
            authorName: authorName,
            participants: [],
            skdStatus: "예정"
        });
        setTouched({
            skdName: false,
            skdStartDttm: false,
            skdEndDttm: false,
            skdLocation: false,
            skdMemo: false
        });
        setSkdNameError("");
        setDateError("");
    };
    const openDetailDialog = () => { setDetailDialogOpen(true); };
    const closeDetailDialog = () => { setDetailDialogOpen(false); };

    const handleEventClick = (info) => {
        if (info.event.url && info.event.url.includes('google.com/calendar')) {
            info.jsEvent.preventDefault();
        } else {
            onEventClickHandler(info);
        }
    };

    const onEventClickHandler = (selected) => {
        openDetailDialog();
        setSelectedEvent(selected.event);
    };

    const onDelete = () => { setConfirmDeleteOpen(true); };
    const onCloseConfirmDelete = () => { setConfirmDeleteOpen(false); };

    const handleConfirmDelete = () => {
        try {
            handleDelete(selectedEvent);
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("일정 삭제 중 에러 발생 handleDelete: ", error);
        }
    };

    const handleDelete = (event) => {
        if (event) {
            try {
                deleteScheduleAPI(event.id);
                setNewScheduleAdded(!newScheduleAdded);
            } catch (error) {
                console.error("일정 삭제 중 에러 발생 handleDelete: ", error);
                alert("일정 삭제에 실패했습니다.");
            }
            closeDetailDialog();
            setSelectedEvent(null);
        }
    };

    const handleUpdateEvent = (selectedEvent, updatedScheduleData) => {
        try {
            updateScheduleAPI(selectedEvent.id, updatedScheduleData);
            alert("일정을 정상적으로 수정하였습니다.");
            dispatch(getScheduleAPI(dptNo));
        } catch (error) {
            console.error("일정 수정 중 에러 발생 handleUpdate: ", error);
            alert("일정 수정에 실패했습니다.");
        }
        closeDetailDialog();
    };

    useEffect(() => {
        if (selectedEvent != null) {
            const skdNo = selectedEvent.id;
            const detail = fetchEvents().find(event => event.id == skdNo);
            if (detail) {
                setScheduleDetail(detail);
            }
        } else {
            setScheduleDetail(null);
        }
    }, [selectedEvent, schedules]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewScheduleData({
            ...newScheduleData,
            [name]: value
        });

        setTouched({
            ...touched,
            [name]: true
        });

        validateInsert();
    };

    const handleSubmit = (newScheduleData) => {
        if (!touched.skdName || !touched.skdStartDttm || !touched.skdEndDttm) {
            setTouched({
                ...touched,
                skdName: true,
                skdStartDttm: true,
                skdEndDttm: true
            });
            validateInsert();
            return;
        }

        if (validateInsert()) {
            try {
                insertScheduleAPI(newScheduleData);
                alert("일정이 정상적으로 등록되었습니다.");
                setNewScheduleAdded(!newScheduleAdded);
            } catch (error) {
                console.error("일정 정보 등록하면서 오류가 발생했습니다 :", error);
                alert("일정 등록에 실패하였습니다.");
            }
            onInsertCancelHandler();
        }
    };

    const businessHours = {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '19:00',
    };

    const getEventColor = (skdStatus) => {
        switch (skdStatus) {
            case '예정': return '#F5BF3C';
            case '진행 중': return '#3CB479';
            case '완료': return '#1B9CE3';
            case '보류': return 'grey';
            case '막힘': return '#F2522D';
            default: return '#95A5A6';
        }
    };

    const fetchEvents = () => {
        try {
            const events = schedules.results.schedule.map(schedule => {
                return {
                    title: schedule.skdName,
                    start: moment(schedule.skdStartDttm, "YYYY-MM-DD A h:mm").toISOString(),
                    end: moment(schedule.skdEndDttm, "YYYY-MM-DD A h:mm").toISOString(),
                    id: schedule.skdNo,
                    extendedProps: {
                        skdLocation: schedule.skdLocation,
                        skdMemo: schedule.skdMemo,
                        authorId: schedule.authorId,
                        authorName: schedule.authorName,
                        skdStatus: schedule.skdStatus,
                        participants: schedule.participants.map(participant => {
                            return {
                                participantMemberNo: participant.participantMemberNo,
                                participantName: participant.participantName,
                                participantNo: participant.participantNo
                            };
                        })
                    },
                    backgroundColor: getEventColor(schedule.skdStatus),
                    borderColor: getEventColor(schedule.skdStatus)
                };
            });
            return events;
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    };

    const transformScheduleList = (scheduleList) => {
        return scheduleList.map(schedule => ({
            title: schedule.skdName,
            start: moment(schedule.skdStartDttm).toISOString(),
            end: moment(schedule.skdEndDttm).toISOString(),
            id: schedule.skdNo,
            extendedProps: {
                skdLocation: schedule.skdLocation,
                skdMemo: schedule.skdMemo,
                authorId: schedule.authorId,
                authorName: schedule.authorName,
                skdStatus: schedule.skdStatus,
                participants: schedule.participants.map(participant => ({
                    participantMemberNo: participant.participantMemberNo,
                    participantName: participant.participantName,
                    participantNo: participant.participantNo
                }))
            },
            backgroundColor: getEventColor(schedule.skdStatus),
            borderColor: getEventColor(schedule.skdStatus)
        }));
    };

    const filteredScheduleList = schedules.results?.schedule?.filter(schedule =>
        (subscribedMembers.includes(schedule.authorId) ||
            schedule.participants.some(participant => subscribedMembers.includes(participant.participantMemberNo))) &&
        (selectedStatus.length === 0 || selectedStatus.includes(schedule.skdStatus))
    ) || [];

    const transformedEvents = transformScheduleList(filteredScheduleList);

    const REACT_APP_GOOGLE_CALENDAR_API_KEY = process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY;

    return (
        <main id="main" className="main">
            <div className="title">
                <h2>부서별 일정</h2>
                <Tooltip
                    placement="bottom"
                    variant="solid"
                    arrow
                    color="neutral"
                    title={
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                maxWidth: 320,
                                justifyContent: 'center',
                                p: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', // 툴팁 박스 배경색 조정
                                borderRadius: '4px'
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 1 }}>
                                <EventNoteIcon color="action" />
                                <div>
                                    <Typography fontWeight="lg" fontSize="sm" color="textPrimary">
                                        새로운 일정을 등록하시려면 날짜를 선택하세요.
                                    </Typography>
                                </div>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 1 }}>
                                <EditCalendarIcon color="action" />
                                <div>
                                    <Typography textColor="text.secondary" fontSize="sm" color="textPrimary" sx={{ mb: 1 }}>
                                        일정 수정, 삭제 또는 상세 조회를 원하시면, 해당 일정을 선택하세요.
                                    </Typography>
                                </div>
                            </Box>
                        </Box>
                    }
                >
                    <HelpOutlineIcon />
                </Tooltip>
            </div>
            {calendarReady && (
                <Box flex="1 1 100%" ml="15px" mt="15px" >
                    <Grid item md>
                        <FullCalendar
                            locale="ko"
                            height="100vh"
                            eventColor='red'
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                interactionPlugin,
                                listPlugin,
                                googleCalendarPlugin
                            ]}
                            headerToolbar={{
                                left: "prev next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                            }}
                            initialView="dayGridMonth"
                            editable={true}
                            selectable={true}
                            dayMaxEvents={true}
                            select={onDateClickHandler}
                            eventClick={handleEventClick}
                            eventSources={[
                                {
                                    events: transformedEvents
                                },
                                {
                                    googleCalendarApiKey: REACT_APP_GOOGLE_CALENDAR_API_KEY,
                                    googleCalendarId: 'ko.south_korea#holiday@group.v.calendar.google.com',
                                    className: 'holiday'
                                }
                            ]} buttonText={{
                                today: '오늘',
                                month: '월',
                                week: '주',
                                day: '일',
                                list: '목록'
                            }}
                            businessHours={businessHours}
                            slotMinTime="08:00"
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid maxWidth={'350px'}>
                            <SubscriptionList
                                subscribedMembers={subscribedMembers}
                                setSubscribedMembers={setSubscribedMembers}
                                selectedStatus={selectedStatus}
                                setSelectedStatus={setSelectedStatus}
                            />
                        </Grid>

                    </Grid>
                </Box>
            )}

            <Dialog open={insertScheduleDialogOpen} onClose={onInsertCancelHandler} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "10px" } }}>
                <DialogTitle variant="h4" ml={3} mt={3}>일정 등록</DialogTitle>
                <ScheduleForm
                    newScheduleData={newScheduleData}
                    onInsertCancelHandler={onInsertCancelHandler}
                    handleSubmit={handleSubmit}
                    handleInputChange={handleInputChange}
                    handleParticipantsChange={handleParticipantsChange}
                    skdNameError={skdNameError}
                    dateError={dateError}
                    setTouched={setTouched}
                    touched={touched}
                    members={members}
                    dptNo={dptNo}
                />
            </Dialog>

            <Dialog open={detailDialogOpen} onClose={closeDetailDialog} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "10px" } }}>
                <ScheduleDetail
                    open={detailDialogOpen}
                    inputChangeHandler={handleInputChange}
                    scheduleDetail={scheduleDetail}
                    handleDelete={handleDelete}
                    handleUpdate={handleUpdateEvent}
                    closeDetailDialog={closeDetailDialog}
                    onCloseConfirmDelete={onCloseConfirmDelete}
                    members={members}
                    dptNo={dptNo}
                />
            </Dialog>
        </main>
    );
};

export default Calendar;