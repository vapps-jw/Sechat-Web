// const useAuth = () => {
//   const config = useRuntimeConfig();

//   const login = (username, password) => {
//     console.log("--> logging in", `${username}-${password}`);
//     const { error } = useFetch(`${config.public.apiBase}/account/login`, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//       method: "POST",
//       credentials: "include",
//       body: {
//         username: username,
//         password: password,
//       },
//     });

//     if (error.value) {
//       throw createError({
//         ...error.value,
//         statusMessage: "--> Login Failed",
//       });
//     }

//     console.log("--> login passed");
//     useFetch(`${config.public.apiBase}/account/test`, {
//       credentials: "include",
//     });

//     const user = useUser();
//     console.log("--> current profile", user.profile.value);

//     const { data } = useFetch(`${config.public.apiBase}/user/get-profile`, {
//       credentials: "include",
//     });

//     console.log("--> profile from the api", data.value);

//     user.profile.value = data.value;

//     console.log("--> logged in", user.profile.value);
//   };

//   return { login };
// };

// export default useAuth;
