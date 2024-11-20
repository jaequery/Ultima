"use client";

import { useTrpc } from "@web/contexts/TrpcContext";
import { format } from "date-fns";
import kebabCase from "lodash/kebabCase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BooleanParam,
  NumberParam,
  StringParam,
  useQueryParam,
  withDefault,
} from "use-query-params";
import { useUserContext } from "../user/UserContext";

export default function PostListForum(params: {
  categoryId?: number;
  page?: number;
  perPage?: number;
  showPagination?: boolean;
  search?: string;
}) {
  const { trpc } = useTrpc();
  const { currentUser } = useUserContext();
  const router = useRouter();
  const [categoryId, setCategoryId] = useQueryParam(
    "categoryId",
    withDefault(NumberParam, params.categoryId ?? 0)
  );
  const [page, setPage] = useQueryParam(
    "page",
    withDefault(NumberParam, params.page ?? 1)
  );
  const [perPage, setPerPage] = useQueryParam(
    "perPage",
    withDefault(NumberParam, params.perPage ?? 10)
  );
  const [showPagination, setShowPagination] = useQueryParam(
    "showPagination",
    withDefault(BooleanParam, params.showPagination ?? false)
  );
  const [search, setSearch] = useQueryParam(
    "search",
    withDefault(StringParam, params.search)
  );

  const postList = trpc.postRouter.findAll.useQuery({
    page,
    perPage,
    categoryId,
    search,
  });

  const category = trpc.categoryRouter.findById.useQuery({
    id: categoryId,
  });
  return (
    <>
      <div className="flex items-center justify-between px-2 ">
        <h3 className="font-bold text-lg ">
          <Link
            className="hover:text-red-400"
            href={`/posts/?categoryId=${categoryId}`}
          >
            {category?.data?.name}
          </Link>
        </h3>
        {!params.showPagination && (
          <Link
            className="text-sm hover:text-red-400"
            href={`/posts/?categoryId=${categoryId}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={0.8}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        )}
        {params.showPagination &&
          (!category?.data?.adminWriteOnly ||
            (category?.data?.adminWriteOnly &&
              currentUser?.roles?.some((r) => r.name === "Admin"))) && (
            <Link
              href={
                currentUser ? `/posts/new/?categoryId=${categoryId}` : "/login"
              }
              className="py-1 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent bg-red-500 text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              글쓰기
            </Link>
          )}
      </div>
      <div className=" rounded-xl  py-4">
        <div className="">
          {postList?.isLoading && (
            <div className="flex animate-pulse">
              <div className="flex-shrink-0">
                <span className="size-12 block bg-gray-200 rounded-full dark:bg-gray-700" />
              </div>
              <div className="ms-4 mt-2 w-full">
                <h3
                  className="h-4 bg-gray-200 rounded-full dark:bg-gray-700"
                  style={{ width: "40%" }}
                />
                <ul className="mt-5 space-y-3">
                  <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
                  <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
                  <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
                  <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
                </ul>
              </div>
            </div>
          )}

          {postList?.data?.records.length === 0 && (
            <div className="flex text-center text-gray-500 justify-center items-center bg-white rounded-lg p-4">
              게시물이 없습니다
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-x-auto  sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400  border-t-4">
                  <tr>
                    <th scope="col" className="px-6 py-3 w-auto">
                      제목
                    </th>
                    <th scope="col" className="w-[100px]">
                      글쓴이
                    </th>
                    <th scope="col" className=" w-[100px]">
                      날짜
                    </th>
                    <th scope="col" className="">
                      조회
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {postList?.data?.records?.map((post) => (
                    <tr
                      key={post.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        router.push(
                          `/posts/${post.id}/${kebabCase(post.title)}?categoryId=${categoryId}`
                        );
                      }}
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900  dark:text-white w-auto"
                      >
                        {post.title}
                        {post?.postComments && post?.postComments?.length > 0
                          ? ` (${post?.postComments?.length})`
                          : ""}
                      </th>
                      <td className="w-[100px]">
                        {post?.user?.firstName || "Anonymous"}
                      </td>
                      <td className=" w-[100px]">
                        {format(post.createdAt, "MM-dd-yyyy")}
                      </td>
                      <td className="w-[50px]">{post?.viewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {showPagination && (
          <div className="py-4 grid gap-3 md:flex md:justify-between md:items-center mt-24">
            <div className="flex items-center justify-center gap-2">
              <p>
                <select
                  onChange={(event) => {
                    if (event) {
                      setPerPage?.(+event.target.value);
                    }
                  }}
                  className="py-2 pe-9 block w-full border-gray-200  text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {postList?.data && (
                  <>
                    <span className="text-gray-800 dark:text-gray-200">
                      {(page - 1) * perPage + 1} ~{" "}
                      {(page - 1) * perPage +
                        1 +
                        (postList?.data?.records?.length || 0) -
                        1}{" "}
                    </span>{" "}
                    <span className="text-gray-800 dark:text-gray-200">
                      ({postList?.data?.total || 0} 전채)
                    </span>{" "}
                  </>
                )}
              </p>
            </div>
            <div>
              <div className="inline-flex gap-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage?.(page === 1 ? 1 : page - 1);
                  }}
                  disabled={page === 1 || !postList?.data ? true : false}
                  className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage?.(page + 1);
                  }}
                  disabled={
                    page === postList?.data?.lastPage ||
                    !postList?.data ||
                    (postList?.data && postList?.data?.records.length === 0)
                      ? true
                      : false
                  }
                  className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  Next
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}