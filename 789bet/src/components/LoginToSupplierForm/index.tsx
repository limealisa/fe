/* eslint-disable @next/next/no-img-element */
"use client";

import { Button, Form, Input, Spin } from "antd";
import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import apiClient from "@/api/apiClient";
import {
  ConfigAuthEndPoint,
  ConfigCapchaEndPoint,
} from "@/api/services/contants";
import { useEffect, useState } from "react";
import { useUser } from "@/context/useUserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getMessage, openNotification } from "@/utils/check";
import { LoadingOutlined } from "@ant-design/icons";
import { loginDto } from "@/dto/authDto";
import ModalError from "../ModalError";
import { usePlayGame } from "@/hooks/usePlayGame";
import { API_GATE } from "@/constant/gate";
import authService from "@/api/services/auth.servicer";

interface Pcaptcha {
  key: string;
  svg: string;
}

export default function LoginToSupplier() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const ridrect = searchParams.get("url");
  const d = searchParams.get("d");
  const gameid = searchParams.get("gameid");
  const gpid = searchParams.get("gpid");
  const supplier = searchParams.get("supplier");
  const type = searchParams.get("type");
  const lang = searchParams.get("lang");

  const { loginUser } = useUser();
  const { playGame } = usePlayGame();
  const [captcha, setCaptcha] = useState<Pcaptcha | undefined>(undefined);
  const [hoverLogin, setHoverLogin] = useState(false);
  const [form] = Form.useForm();
  const [currentDomain, setCurrentDomain] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [openModalError, setOpenModalError] = useState(false);
  const [textModalError, setTextModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  const handleOnClickCaptcha = async () => {
    setLoadingCaptcha(true);
    apiClient
      .post<any>({ url: ConfigCapchaEndPoint.LOG })
      .then((response) => {
        const { data } = response.data;
        setCaptcha({
          key: data.key,
          svg: data.svg,
        });
      })
      .catch((error) => {})
      .finally(() => setLoadingCaptcha(false));
  };

  const onFinish = async (values: any) => {
    console.log("Form submitted with values:", values);
    setLoadingLogin(true);
    try {
      // BC88BET style: chỉ cần username, password, captcha cố định
      console.log("Calling signin API...");
      const response = await authService.signin(
        values.username.trim(),
        values.password.trim()
      );
      console.log("Signin response:", response);
      
      // BC88BET response format: { status: true, access_token, user } hoặc { status: false, msg }
      // authInstance interceptor đã trả về response.data, nên response đã là data rồi
      const responseData = response as any;
      if (responseData?.status === true) {
        const { access_token, user } = responseData;
        loginUser(user || response, access_token);
        
        if (ridrect) {
          router.push(ridrect);
        } else if (d && gameid && gpid && supplier && type) {
          // Sử dụng usePlayGame hook với auto wallet transfer sau khi đăng nhập thành công
          await playGame({
            gameId: gameid,
            gpid: gpid,
            supplier: supplier,
            type: type,
            lang: lang || "en",
          });
        } else {
          // Nếu không có redirect và không có game params, redirect về trang chủ
          router.push("/");
        }
      } else {
        setOpenModalError(true);
        setTextModalError(responseData?.msg || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      setOpenModalError(true);
      setTextModalError(error?.response?.data?.msg || error?.message || "Đăng nhập thất bại");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleCloseModal = () => {
    setIsSubmitting(false);
    form.setFieldValue("captchaText", undefined);
    setOpenModalError(false);
    setLoadingLogin(false);
  };

  const handleFormFailed = (errorInfo: any) => {
    if (isSubmitting) {
      const usernameError = errorInfo.errorFields.find(
        (field: any) => field.name[0] === "username"
      );
      const passwordError = errorInfo.errorFields.find(
        (field: any) => field.name[0] === "password"
      );
      if (usernameError) {
        setOpenModalError(true);
        setTextModalError("Vui lòng nhập tên tài khoản");
      } else if (passwordError) {
        setOpenModalError(true);
        setTextModalError("Vui lòng nhập mật khẩu");
      } else {
        setOpenModalError(true);
        setTextModalError(
          "mã xác nhận không được bỏ trống, xin lấy mã xác nhận"
        );
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.formContent}>
      <Form
        name="basic"
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={handleFormFailed}>
        <Form.Item
          name="username"
          className={styles.boxInput}
          noStyle={true}
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tài khoản!",
            },
          ]}>
          <Input
            placeholder="Tài khoản"
            className={styles.inputForm}
            style={{
              backgroundImage: "url('/images/form/stl_icon_username.png')",
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          className={styles.boxInput}
          noStyle={true}
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tài khoản!",
            },
          ]}>
          <Input.Password
            placeholder="Mật khẩu"
            className={styles.inputForm}
            style={{
              backgroundImage: "url('/images/form/stl_icon_password.png')",
              display: "flex",
            }}
            iconRender={(visible) =>
              visible ? (
                <FontAwesomeIcon icon={faEye} color="#ffffff" />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} color="#ffffff" />
              )
            }
          />
        </Form.Item>

        {/* <div className="relative">
          <Form.Item
            name="captchaText"
            className={styles.boxInput}
            noStyle={true}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập captcha!",
              },
            ]}>
            <Input
              onClick={() => handleOnClickCaptcha()}
              placeholder="Mã xác minh"
              className={styles.captcha}
            />
          </Form.Item>
          <div className="absolute right-[calc(100%-167px)] top-0 h-full z-50">
            {loadingCaptcha ? (
              <Spin
                indicator={
                  <LoadingOutlined style={{ fontSize: 12, color: "white" }} />
                }
              />
            ) : (
              captcha?.svg && (
                <img
                  src={`data:image/png;base64,${captcha?.svg}`}
                  alt=""
                  className="w-[101px] h-full"
                />
              )
            )}
          </div>
        </div> */}

        <div className="flex ">
          <Button
            htmlType="submit"
            onMouseEnter={() => setHoverLogin(true)}
            onMouseLeave={() => setHoverLogin(false)}
            onClick={() => setIsSubmitting(true)}
            disabled={loadingLogin}
            className={styles.btnSubmit}>
            {loadingLogin ? "Đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className={`${styles.popup} ${hoverLogin ? "flex" : "hidden"}`}>
            <div>Nhấp vào Đăng nhập để đồng ý</div>
            <div>Thỏa thuận người dùng</div>
          </div>

          <button type="button" className={styles.fpw}>
            Quên mật khẩu
          </button>
        </div>
      </Form>
      <ModalError
        setOpenModal={handleCloseModal}
        openModal={openModalError}
        text={textModalError}
      />
    </div>
  );
}
