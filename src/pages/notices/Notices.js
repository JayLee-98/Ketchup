import SearchBar from '../../components/contents/SearchBar';
import BootstrapTable from '../../components/contents/BootstrapTable';
import PaginationButtons from '../../components/contents/PaginationButtons';
import ButtonGroup from '../../components/contents/ButtonGroup';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { callGetNoticeListAPI } from '../../apis/NoticeAPICalls';
import { useDispatch, useSelector } from 'react-redux';
import { BsMegaphone } from 'react-icons/bs';
import FormatDateTime from '../../components/contents/FormatDateTime';
import { decodeJwt } from '../../utils/tokenUtils';

const Notices = () => {
  const dispatch = useDispatch();
  const result = useSelector(state => state.noticeReducer);
  const noticeList = result.noticelist || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState(''); // 추가
  const navigate = useNavigate();

  console.log("noticeList : ", noticeList);

  // 필독 공지와 일반 공지를 분리
  const pinnedNotices = noticeList.filter(notice => notice.noticeFix === 'Y').map(notice => ({
    ...notice,
    noticeTitle: (
      <>
        <span style={{ marginRight: '5px' }}>
          [ 필독&nbsp;
          <span style={{ color: '#EC0B0B' }}>
            <BsMegaphone />
          </span>
          &nbsp;]
        </span>{notice.noticeTitle}
      </>
    ),
    noticeCreateDttm: FormatDateTime(notice.noticeCreateDttm) // 등록일 형식화 적용

  }));
  const normalNotices = noticeList.filter(notice => notice.noticeFix !== 'Y');

  // 중복된 noticeNo 제거 및 공지 정렬
  const sortedNormalNotices = [...normalNotices]
    .sort((a, b) => new Date(b.noticeCreateDttm) - new Date(a.noticeCreateDttm))
    .map(item => ({
      ...item,
      noticeCreateDttm: FormatDateTime(item.noticeCreateDttm) // 등록일 형식화 적용
    }));


  const mergedNoticeList = [...pinnedNotices, ...sortedNormalNotices];  // 합쳐진 공지 리스트
  const totalItems = mergedNoticeList.length;                           // 페이지당 필독 공지와 일반 공지의 총 개수
  const itemsPerPage = 10;                                              // 각 페이지별 아이템 수 계산

  // 현재 페이지에 보여질 필독 공지와 일반 공지 구하기
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNormalNotices = sortedNormalNotices.slice(indexOfFirstItem, indexOfLastItem);  // 현재 페이지에 보여질 일반 공지
  const currentItems = [...pinnedNotices, ...currentNormalNotices];                    // 현재 페이지의 필독 공지와 일반 공지 목록
  console.log("currentItems : ", currentItems);

  // 컬럼 제목 목록
  const columns = [
    ['noticeNo', '공지번호'],
    ['noticeTitle', '제목'],
    ['memberName', '작성자'],
    ['noticeCreateDttm', '등록일']
  ];

  const handleRowClick = (index) => {
    const realIndex = (currentPage - 1) * itemsPerPage + index;
    const noticeNo = mergedNoticeList[realIndex]?.noticeNo;
    console.log(noticeNo);
    navigate(`/notices/${noticeNo}`);
  };

   // 검색어를 API 호출 함수에 전달하는 함수입니다.
   const handleSearch = (searchKeyword) => {
    setSearchKeyword(searchKeyword); // 검색어 설정
    dispatch(callGetNoticeListAPI(searchKeyword));
  }

  useEffect(() => {
    // 페이지가 처음 로드될 때와 검색어가 변경될 때마다 API 호출
    handleSearch(searchKeyword); // 검색어 상태를 API 호출 함수에 전달
  }, [dispatch, searchKeyword]); // dispatch 함수와 검색어 상태가 의존성으로 추가됨

  // 사용자의 직위 이름
  const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
  console.log("[ loginToken ] ", loginToken.role);

  const totalPages = Math.ceil(mergedNoticeList.length / itemsPerPage);

  return (
    <main id="main" className="main">
      <div className="title">
        <h2>공지사항</h2>
        <SearchBar onSearch={handleSearch} value={searchKeyword} />
      </div>

      <div className="col-lg-12">
        <div className="row"></div>
        <div className="list">
          {loginToken.role === "LV2" || loginToken.role === "LV3" ? (
            <Link to="/notices/insert">
              <ButtonGroup buttons={[{ label: '등록', styleClass: 'move' }]} />
            </Link>
          ) : null}

          {/* 검색 결과가 없을 때 '00' 표시 */}
          {sortedNormalNotices.length === 0 && (
            <>
              <BootstrapTable data={currentItems} columns={columns} onRowClick={handleRowClick} />
              <p style={{textAlign: 'center'}}>'{searchKeyword}' 제목 공지가 없습니다.</p>
            </>
          )}

          {/* 검색 결과가 있을 때만 테이블 표시 */}
          {sortedNormalNotices.length > 0 && (
            <>
              <BootstrapTable data={currentItems} columns={columns} onRowClick={handleRowClick} />
              {currentPage <= totalPages && (
                <PaginationButtons totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={(pageNumber) => setCurrentPage(pageNumber)} />
              )}            
            </>
          )}
          </div>
      </div>
    </main>
  );
};

export default Notices;

// import SearchBar from '../../components/contents/SearchBar';
// import BootstrapTable from '../../components/contents/BootstrapTable';
// import PaginationButtons from '../../components/contents/PaginationButtons';
// import ButtonGroup from '../../components/contents/ButtonGroup';
// import { Link, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { callGetNoticeListAPI } from '../../apis/NoticeAPICalls';
// import { useDispatch, useSelector } from 'react-redux';
// import { BsMegaphone } from 'react-icons/bs';
// import FormatDateTime from '../../components/contents/FormatDateTime';
// import { decodeJwt } from '../../utils/tokenUtils';

// const Notices = () => {
//   const dispatch = useDispatch();
//   const result = useSelector(state => state.noticeReducer);
//   const noticeList = result.noticelist || [];
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchKeyword, setSearchKeyword] = useState(''); // 추가
//   const navigate = useNavigate();

//   console.log("noticeList : ", noticeList);

//   // 필독 공지와 일반 공지를 분리
//   const pinnedNotices = noticeList.filter(notice => notice.noticeFix === 'Y').map(notice => ({
//     ...notice,
//     noticeTitle: (
//       <>
//         <span style={{ marginRight: '5px' }}>
//           [ 필독&nbsp;
//           <span style={{ color: '#EC0B0B' }}>
//             <BsMegaphone />
//           </span>
//           &nbsp;]
//         </span>{notice.noticeTitle}
//       </>
//     ),
//     noticeCreateDttm: FormatDateTime(notice.noticeCreateDttm) // 등록일 형식화 적용

//   }));
//   const normalNotices = noticeList.filter(notice => notice.noticeFix !== 'Y');

//   // 중복된 noticeNo 제거 및 공지 정렬
//   const sortedNormalNotices = [...normalNotices]
//     .sort((a, b) => new Date(b.noticeCreateDttm) - new Date(a.noticeCreateDttm))
//     .map(item => ({
//       ...item,
//       noticeCreateDttm: FormatDateTime(item.noticeCreateDttm) // 등록일 형식화 적용
//     }));


//   const mergedNoticeList = [...pinnedNotices, ...sortedNormalNotices];  // 합쳐진 공지 리스트
//   const totalItems = mergedNoticeList.length;                           // 페이지당 필독 공지와 일반 공지의 총 개수
//   const itemsPerPage = 10;                                              // 각 페이지별 아이템 수 계산

//   // 현재 페이지에 보여질 필독 공지와 일반 공지 구하기
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentPinnedNotices = pinnedNotices;                                                 // 모든 페이지에서 필독 공지는 상단에 표시
//   const currentNormalNotices = sortedNormalNotices.slice(indexOfFirstItem, indexOfLastItem);  // 현재 페이지에 보여질 일반 공지
//   const currentItems = [...currentPinnedNotices, ...currentNormalNotices];                    // 현재 페이지의 필독 공지와 일반 공지 목록
//   console.log("currentItems : ", currentItems);

//   // 컬럼 제목 목록
//   const columns = [
//     ['noticeNo', '공지번호'],
//     ['noticeTitle', '제목'],
//     ['memberName', '작성자'],
//     ['noticeCreateDttm', '일']
//   ];

//   const handleRowClick = (index) => {
//     const realIndex = (currentPage - 1) * itemsPerPage + index;
//     const noticeNo = mergedNoticeList[realIndex]?.noticeNo;
//     console.log(noticeNo);
//     navigate(`/notices/${noticeNo}`);
//   };

//    // 검색어를 API 호출 함수에 전달하는 함수입니다.
//    const handleSearch = (searchKeyword) => {
//     setSearchKeyword(searchKeyword); // 검색어 설정
//     dispatch(callGetNoticeListAPI(searchKeyword));
//   }

//   useEffect(() => {
//     // 페이지가 처음 로드될 때와 검색어가 변경될 때마다 API 호출
//     handleSearch(searchKeyword); // 검색어 상태를 API 호출 함수에 전달
//   }, [dispatch, searchKeyword]); // dispatch 함수와 검색어 상태가 의존성으로 추가됨

//   // 사용자의 직위 이름
//   const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
//   console.log("[ loginToken ] ", loginToken.role);

//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   return (
//     <main id="main" className="main">
//       <div className="title">
//         <h2>공지사항</h2>
//         <SearchBar onSearch={handleSearch} value={searchKeyword} />
//       </div>

//       <div className="col-lg-12">
//         <div className="row"></div>
//         <div className="list">
//           {loginToken.role === "LV2" || loginToken.role === "LV3" ? (
//             <Link to="/notices/insert">
//               <ButtonGroup buttons={[{ label: '등록', styleClass: 'move' }]} />
//             </Link>
//           ) : null}

//           {/* 검색 결과가 없을 때 '00' 표시 */}
//           {sortedNormalNotices.length === 0 && (
//             <>
//               <BootstrapTable data={currentItems} columns={columns} onRowClick={handleRowClick} />
//               <p style={{textAlign: 'center'}}>'{searchKeyword}' 제목 공지가 없습니다.</p>
//             </>
//           )}

//           {/* 검색 결과가 있을 때만 테이블 표시 */}
//           {sortedNormalNotices.length > 0 && (
//             <>
//               <BootstrapTable data={currentItems} columns={columns} onRowClick={handleRowClick} />
//               {currentPage <= totalPages && (
//                 <PaginationButtons totalPages={totalPages} currentPage={currentPage} onPageChange={(pageNumber) => setCurrentPage(pageNumber)} />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// };

// export default Notices;
