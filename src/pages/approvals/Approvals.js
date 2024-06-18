import AppCategory from "../../components/approvals/AppCategory";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callAppListAPI } from "../../apis/ApprovalAPICalls";
import ApprovalCss from "./Approvals.module.css";
import AppList from "../../components/approvals/AppList";
import { decodeJwt } from "../../utils/tokenUtils";
import PaginationButtons from '../../components/contents/PaginationButtons';

function Approvals() {
    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));

    const [category, setCategory] = useState(window.localStorage.getItem('category')? window.localStorage.getItem('category'): 1);
    const [status, setStatus] = useState('전체'); //문서 상태 관리 초기값 전체 
    const [currentPage, setCurrentPage] = useState(1); //페이지
    const [search, setSearch] = useState('');

    const dispatch = useDispatch();

    const apps = useSelector(state => state.approvalReducer);
    const appList = apps.data?.content;

    let statusList = [];
    switch(category){
        case 1: statusList = ['대기', '진행']; break;
        case 2: statusList = ['완료', '반려', '회수']; break;
        case 3: statusList = ['대기', '진행']; break;
        case 4: statusList = ['대기', '진행', '완료', '반려']; break;
        default : break;
    };

    useEffect(() => {
        window.localStorage.setItem('category', category);
        dispatch(
            callAppListAPI({
                memberNo: loginToken.memberNo,
                category: category,
                status: status,
                search: search,
                currentPage: currentPage
            })
        )
    },[currentPage, status, category])

    const onChangeHandler = (e) => {
        setSearch(e.target.value);
    } //검색어

    const onClickSearchHandler = (e) => {
        e.preventDefault();
        dispatch(
            callAppListAPI({
                memberNo: loginToken.memberNo,
                category: category,
                status: status,
                search: search,
                currentPage: 1
            })
        )
        setSearch('');
    } //검색버튼

    const statusChangeHandler = (e) => {
        setStatus(e.target.value);
        setCurrentPage(1);
    } //드랍박스

    return (
        <main id="main" className={'main'}>
            <AppCategory category={category} setCategory={setCategory} setCurrentPage={setCurrentPage} setStatus={setStatus} setSearch={setSearch} appList={appList}/>
            <div style={{ display: "flex", height: "60px", backgroundColor: "#f5f5f5", alignItems: "center", borderBottom: 'solid 0.5px black'}}>
                <select className={ApprovalCss.selectStatus} onChange={statusChangeHandler} value={status}>
                    <option>전체</option>
                    {statusList.map((item) => (
                        <option>{item}</option>
                    ))}
                </select>
                <div>
                    <form class="search-form d-flex align-items-center" style={{ marginBottom: '0px' }}>
                        <input type="text" name="search" placeholder="제목을 입력하세요" value={search} onChange={onChangeHandler} />
                        <button type="submit" title="SearchBtn" onClick={onClickSearchHandler}><i class="bi bi-search"></i></button>
                    </form>
                </div>
                <Link to={'/approvals/insert'} className={ApprovalCss.movebtn} state={category}>
                    <button className="move-btn" style={{ marginRight: '20px' }}>기안등록</button>
                </Link>
            </div>
            <AppList data={appList} />
            <PaginationButtons totalItems={apps.pageInfo?.total} itemsPerPage={10} currentPage={currentPage} onPageChange={(pageNumber) => setCurrentPage(pageNumber)} />
        </main>
    )
}

export default Approvals;