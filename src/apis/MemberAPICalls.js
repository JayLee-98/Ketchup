import { GET_MEMBER, GET_MEMBERS, POST_LOGIN, POST_REGISTER, PUT_MEMBERS } from '../modules/MemberModule';
import { DELETE_DEPARTMENTS, GET_DEPARTMENTS, POST_DEPARTMENTS, PUT_DEPARTMENTS } from '../modules/DepartmentModule';
import { GET_POSITIONS, POST_POSITIONS, DELETE_POSITIONS, PUT_POSITIONS } from '../modules/PositionModule';
import { request, multipartRequest, noTokenRequest } from './Api';
import { useNavigate } from 'react-router-dom';



export const callGetMemberAPI = ({ memberNo }) => {
    const requestURL = `http://localhost:8080/members/${memberNo}`;

    return async (dispatch, getState) => {
        // 클라이언트 fetch mode : no-cors 사용시 application/json 방식으로 요청이 불가능
        // 서버에서 cors 허용을 해주어야 함
        const result = await fetch(requestURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: 'Bearer ' + window.localStorage.getItem('accessToken'),
            },
        }).then((response) => response.json());
        dispatch({ type: GET_MEMBER, payload: result });
    };
};

export const callLoginAPI = ({ form }) => {
  
    const requestURL = `http://localhost:8080/login`;
   

    return async (dispatch, getState) => {
        // 클라이언트 fetch mode : no-cors 사용시 application/json 방식으로 요청이 불가능
        // 보안상의 이유로 브라우저는 스크립트에서 시작한 교차 출처 HTTP요청을 제한한다.
        // 서버에서 cors 허용을 해주어야 함
        const result = await fetch(requestURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Access-Control-Allow-Origin': '*', // 모든 도멘인에서 접근할 수 있음을 의미 (특정도메인을 넣고싶으면 * 대신 http://test.com)
            },
            body: JSON.stringify({
                memberNo: form.memberNo,
                memberPW: form.memberPW,
            }),
        }).then((response) => response.json());

      
        if (result.status === 200) {
            window.localStorage.setItem('accessToken', result.token);

            await dispatch({ type: POST_LOGIN, payload: result });
            
           
            


        }
    };
};


export const callLogoutAPI = () => {
    return async (dispatch, getState) => {

        dispatch({ type: POST_LOGIN, payload: '' });
      


    };
};

export const callRegisterAPI = ({ form }) => {

   
    const formData = new FormData();

    // 멤버 정보를 JSON 형식으로 변환하여 FormData에 추가
    const memberInfoBlob = new Blob([JSON.stringify({
        memberNo: form.memberNo,
        memberName: form.memberName,
        memberPW: form.memberPW,
        phone: form.phone,
        birthDate: form.birthDate,
        gender: form.gender,
        address: form.address,
        privateEmail: form.privateEmail,
        companyEmail: form.companyEmail,
        department: form.department,
        position: form.position,
        account: form.account,
        status: form.status,
        imgUrl: form.imgUrl,
    })], { type: 'application/json' });
    formData.append('memberInfo', memberInfoBlob);

    // 이미지 파일을 Blob으로 추가

    formData.append('memberImage', form.memberImage);
   


    return async (dispatch) => {
        try {
            const result = await multipartRequest('POST', '/signup', formData);
            console.log('[MemberAPICalls] callRegisterAPI RESULT : ', result);

            if (result.status === 201) {
                dispatch({ type: POST_REGISTER, payload: result });
            }
        } catch (error) {
            console.error('프론트에서 캐치한 Error: ', error);
        }
    };
};

export function callMembersAPI() {
    console.log("=============전체 사원 호출=============");

    return async (dispatch, getState) => {
        const result = await request('GET', '/noPageMembers');
        console.log("전체 사원 호출 API 결과:   ", result.data);

        dispatch({ type: GET_MEMBERS, payload: result.data });
    };
}

export function callPageMembersAPI(currentPage, searchKeyword) {
    console.log("=============전체 사원 호출=============");

    return async (dispatch, getState) => {
        const result = await request('GET', `/members?offset=${currentPage}&search=${searchKeyword}`);
        console.log("전체 사원 호출 API 결과:   ", result.data);

        dispatch({ type: GET_MEMBERS, payload: result.data });
    };
}


export function callResignMemberAPI(memberNo, statusData) {
    console.log("=============사원 퇴사 진행=============");

    return async (dispatch, getState) => {
        const result = await request('PUT', `/auth/resign/${memberNo}`, statusData);
        console.log(`${memberNo}번 사원 퇴사 결과 `, result);
        console.log(`${memberNo}번 사원 퇴사 결과.데이터 `, result.data);

        dispatch({ type: GET_MEMBER, payload: result });
    };
}



export function callDepartmentsAPI() {
    console.log("=============사용중 부서 호출=============");

    return async (dispatch, getState) => {

        const result = await request('GET', '/noPageDeps');
        console.log("사용중 부서 호출 API 결과:   ", result.data);

        dispatch({ type: GET_DEPARTMENTS, payload: result.data });
    };
}

export function callPositionsAPI() {
    console.log("============사용중 직급 호출==============");

    return async (dispatch, getState) => {
        const result = await request('GET', '/noPagePositions');
        console.log("사용중 직급 호출 API 결과:  ", result.data);

        dispatch({ type: GET_POSITIONS, payload: result.data })

    };

}

export function callAllPositionsAPI() {
    console.log("============전체 직급 호출==============");

    return async (dispatch, getState) => {
        const result = await request('GET', '/Positions');
        console.log("전체 직급 호출 API 결과:  ", result.data);
        dispatch({ type: GET_POSITIONS, payload: result.data })

    };

}

export function callAllDepartmentsAPI() {
    console.log("============전체 부서 호출==============");

    return async (dispatch, getState) => {
        const result = await request('GET', '/Deps');
        console.log("전체 직급 호출 API 결과:  ", result.data);
        dispatch({ type: GET_DEPARTMENTS, payload: result.data })

    };

}


export const callUpdateMembersAPI = ({ form }) => {

    if (form.memberImage !== undefined) {

        console.log('여기가 수정 api 시작', form);
        const formData = new FormData();

        // 멤버 정보를 JSON 형식으로 변환하여 FormData에 추가
        const memberInfoBlob = new Blob([JSON.stringify({
            memberNo: form.memberNo,
            memberName: form.memberName,
            phone: form.phone,
            address: form.address,
            privateEmail: form.privateEmail,
            companyEmail: form.companyEmail,
            department: form.department,
            position: form.position,
            account: form.account,
        })], { type: 'application/json' });
        formData.append('memberInfo', memberInfoBlob);

        // 이미지 파일을 Blob으로 추가

        formData.append('memberImage', form.memberImage);



        return async (dispatch) => {
            try {
                const result = await multipartRequest('PUT', '/members', formData);


                if (result.status === 201) {
                    dispatch({ type: PUT_MEMBERS, payload: result });
                }
            } catch (error) {
                console.error('프론트에서 캐치한 Error: ', error);
            }
        };

    }
    else {

        return async (dispatch, getState) => {
            const result = await request('PUT', '/membersNoImage', form);

            if (result.status == 200) {
                dispatch({ type: PUT_MEMBERS, payload: result });
            } else {
                throw new Error('에러');
            }
        }


    }



};



export function callAddPositionAPI(form) {


    return async (dispatch, getState) => {
        const result = await request('POST', '/signupPosition', form);


        dispatch({ type: POST_POSITIONS, payload: result.data })

    };

}



export function callDeletePositionAPI(positionNo) {


    return async (dispatch, getState) => {
        const result = await request('DELETE', `/positions/${positionNo}`);

        dispatch({ type: DELETE_POSITIONS, payload: result.data })

    };

}



export function callUpdatePositionAPI(positionNo, form) {
    console.log("=============직급 수정 진행=============");
    console.log('API 내부 positionNO', positionNo);
    console.log('API 내부 form', form);

    return async (dispatch, getState) => {
        const result = await request('PUT', `/signupPosition/${positionNo}`, form);
        console.log('수정결과 ', result);

        dispatch({ type: PUT_POSITIONS, payload: result });
    };
}



export function callUpdatePositionStatusAPI(positionNo) {

    console.log('API 내부 positionNO', positionNo);
    const fakeDTO = {
        positionDTO: null
    };


    return async (dispatch, getState) => {
        const result = await request('PUT', `/signupPosition/${positionNo}`, fakeDTO);
        console.log('수정결과 ', result);

        dispatch({ type: PUT_POSITIONS, payload: result });
    };
}



export function callAddDepartmentAPI(form) {

    console.log('=========API 진행중=========', form);

    return async (dispatch, getState) => {
        const result = await request('POST', '/signupDep', form);


        dispatch({ type: POST_DEPARTMENTS, payload: result.data })

    };

}



export function callDeleteDepartmentAPI(depNo) {

    return async (dispatch, getState) => {
        const result = await request('DELETE', `/deps/${depNo}`);

        dispatch({ type: DELETE_DEPARTMENTS, payload: result.data })

    };

}



export function callUpdateDepartmentAPI(depNo, form) {
    console.log("=============부서 수정 진행=============");


    return async (dispatch, getState) => {
        const result = await request('PUT', `/deps/${depNo}`, form);
        console.log('수정결과 ', result);

        dispatch({ type: PUT_DEPARTMENTS, payload: result });
    };
}



export function callUpdateDepartmentStatusAPI(depNo) {

    const fakeDTO = {
        depNo: depNo,
        depName: "status"
    };
    return async (dispatch, getState) => {
        const result = await request('PUT', `/deps/${depNo}`, fakeDTO);

        dispatch({ type: PUT_DEPARTMENTS, payload: result });
    };
}



export function callUpdateMyPWAPI(myNo, newPW) {

  

    return async (dispatch, getState) => {
        const result = await request('PUT', `/PW/${myNo}`, newPW)
      
        

    };

}


export function callSendEmailAPI(myNo) {
    return async () => {
        const result = await request('GET', `/email/${myNo}`)
      
        return null;

    };

}


export function sendCodeAPI(myNo, receiveCode) {


    return async (dispatch, getState) => {
        const result = await request('POST', `/verifyEmail/${myNo}/${receiveCode}`)
      
        if (result.message == '인증성공') {
            
            return true;
        } else {
            return false;
        }

    };
}




