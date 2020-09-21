import conf from "../config/configs";

const apiLogin = (phone, pass) => {
  return fetch(conf.base_api + "users/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: phone,
      password: pass,
    }),
  })
    .then((res) => {
      console.log(res.status);
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiRequestReset = (phone) => {
  return fetch(conf.base_api + "users/request/code/" + phone, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: phone,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiValidateCode = (phone, code) => {
  return fetch(
    conf.base_api + "users/validate/phone/" + phone + "/code/" + code,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
      }),
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiResetPassword = (postData) => {
  return fetch(conf.base_api + "users/change/password", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetUserStatus = (xtoken) => {
  return fetch(conf.base_api + "users/loginstatus", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetUserInfo = (xtoken) => {
  return fetch(conf.base_api + "users/data", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiNewStudent = (postData) => {
  return fetch(conf.base_api + "users/new/student", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      // console.log(res.status);
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetSubjects = (xtoken) => {
  return fetch(conf.base_api + "topics/user/subjects", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res.status + "::" + res.statusText);
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetPaper = (xtoken) => {
  return fetch(conf.base_api + "topics/user/papers", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};

const apiGetQuestion = (xtoken) => {
  return fetch(conf.base_api + "topics/user/assignments", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetTopics = (xtoken, subject) => {
  return fetch(conf.base_api + "topics/subject/topics/" + subject, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetFreeLessons = (xtoken = null) => {
  return fetch(conf.base_api + "topics/free/lessons", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetLessons = (xtoken, topic) => {
  return fetch(conf.base_api + "topics/topic/lessons/" + topic, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetPacks = (xtoken) => {
  return fetch(conf.base_api + "topics/packages", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      token: xtoken,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiPostOrder = (xtoken, pack, orderid) => {
  return fetch(conf.base_api + "topics/student/order", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      mpackage: pack,
      orderid: orderid,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiPayOrder = (xtoken, orderid) => {
  return fetch(conf.base_api + "topics/mpesa/mpesa", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      orderid: orderid,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(JSON.stringify(res.json()));
      }
    })
    .catch((error) => {
      console.log(error);
      return Promise.reject("Server authorization failed");
    });
};
const apiPayStatus = (orderid) => {
  return fetch(conf.base_api + "topics/mpesa/status/" + orderid, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderid: orderid,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
/** ============================ */
/** ========== corp ======== */
const apiNewCorporate = (postData) => {
  return fetch(conf.base_api + "users/new/corporate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetLiveLessons = (xtoken) => {
  return fetch(conf.base_api + "topics/live/lessons", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetLiveLessonsPaid = (xtoken) => {
  return fetch(conf.base_api + "topics/live/lessons/paid", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiPostCorpOrder = (xtoken, lesson, orderid) => {
  return fetch(conf.base_api + "topics/corporate/order", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      lesson: lesson,
      orderid: orderid,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetTransactions = (xtoken) => {
  return fetch(conf.base_api + "topics/corp/transactions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      data: null,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      return Promise.reject("Server authorization failed");
    });
};
const apiGetForum = (xtoken, subject) => {
  return fetch(conf.base_api + "topics/my/asked/questions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + xtoken,
    },
    body: JSON.stringify({
      subject: subject,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res);
      }
    })
    .catch((error) => {
      console.log("eee34::: " + error);
      return Promise.reject("Server authorization failed");
    });
};
const apiPostForum = (xtoken, postData) => {
  return fetch(conf.base_api + "topics/ask/question", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + xtoken,
    },
    body: postData,
  })
    .then((res) => {
      // console.log("body is:: " + JSON.stringify(res));
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      // console.log("body is:: " + error);
      return Promise.reject("Server authorization failed");
    });
};
export {
  apiLogin,
  apiRequestReset,
  apiValidateCode,
  apiResetPassword,
  apiGetUserInfo,
  apiNewStudent,
  apiNewCorporate,
  apiGetSubjects,
  apiGetPaper,
  apiGetQuestion,
  apiGetTopics,
  apiGetLessons,
  apiGetPacks,
  apiPostOrder,
  apiPayOrder,
  apiPayStatus,
  apiGetUserStatus,
  apiGetLiveLessons,
  apiPostCorpOrder,
  apiGetLiveLessonsPaid,
  apiGetTransactions,
  apiGetForum,
  apiPostForum,
  apiGetFreeLessons,
};
