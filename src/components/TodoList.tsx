"use client";
import React, { useEffect, useState } from "react";
import scss from "./TodoList.module.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  useDeleteTodoMutation,
  useDeleteTodosMutation,
  useGetTodosQuery,
  usePostTodoMutation,
  useUpdateTodoMutation,
} from "@/redux/api/todo";
import { useUploadFileMutation } from "@/redux/api/upload";
import Image from "next/image";

const TodoList = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const {
    handleSubmit: handleSubmitAdd,
    register: registerAdd,
    reset: resetAdd,
  } = useForm<ITodo>();
  const {
    handleSubmit: handleSubmitEdit,
    register: registerEdit,
    reset: resetEdit,
    setValue,
  } = useForm<ITodo>();
  const { data: getTodo = [] } = useGetTodosQuery();
  const [postTodo] = usePostTodoMutation();
  const [upload] = useUploadFileMutation();
  const [editMutation] = useUpdateTodoMutation();
  const [deleteTodos] = useDeleteTodosMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const onSubmit: SubmitHandler<ITodo> = async (data) => {
    try {
      const file = data.file[0];
      const formData = new FormData();
      formData.append("file", file);
      const { data: responseUrl } = await upload(formData);
      if (!responseUrl) {
        alert("Ошибка при загрузке");
      }
      const newData = {
        name: data.name,
        age: data.age,
        file: responseUrl?.url,
      };
      const { data: responseData, error } = await postTodo(newData);
      console.log(responseData);
      setTodos(responseData!);
      resetAdd();
    } catch (error) {
      console.log(error);
    }
  };
  const fetchTodos = async () => {
    setTodos(getTodo);
  };
  useEffect(() => {
    fetchTodos();
  }, [getTodo]);

  const deleteHandler = async (id: number) => {
    const { data: responseData } = await deleteTodo(id);
    setTodos(responseData!);
  };

  const editHandler: SubmitHandler<ITodo> = async (data) => {
    const file = data.file[0];
    const formData = new FormData();
    formData.append("file", file);
    const { data: responseUrl } = await upload(formData);
    const newData = {
      name: data.name,
      age: data.age,
      file: responseUrl?.url || data.file,
    };
    const updateData = {
      _id: editId,
      data: newData,
    };
    const { data: responseData } = await editMutation(updateData);
    setTodos(responseData!);
    setEditId(null);
    resetEdit();
  };
  const deleteAllHandler = async () => {
    const { data: responseData } = await deleteTodos();
    setTodos(responseData!);
  };
  return (
    <>
      <div className={scss.todoListToCenter}>
        <h1 className={scss.todoList}>TodoList</h1>
      </div>
      <section className={scss.sectionAdd}>
        <form className={scss.formAdd} onSubmit={handleSubmitAdd(onSubmit)}>
          <input
            className={scss.input}
            placeholder="Name"
            type="text"
            {...registerAdd("name", { required: true })}
          />
          <input
            className={scss.input}
            placeholder="Age"
            type="number"
            {...registerAdd("age", { required: true })}
          />
          <input
            className={scss.inputFile}
            placeholder="File"
            type="file"
            {...registerAdd("file", { required: true })}
          />
          <button className={scss.buttonAdd} type="submit">
            Add Todo
          </button>
        </form>
      </section>
      <br />
      <div className={scss.deleteBtnToCenter}>
        <button className={scss.button} onClick={() => deleteAllHandler()}>
          DeleteAll
        </button>
      </div>
      {todos.map((el) => (
        <div key={el._id}>
          {editId === el._id ? (
            <div className={scss.formEdit}>
              <br />
              <Image
                className={scss.image}
                src={el.file}
                width={500}
                height={300}
                alt="img"
              />
              <form
                className={scss.formEdit}
                onSubmit={handleSubmitEdit(editHandler)}
              >
                <input
                  className={scss.input}
                  placeholder="Name"
                  type="text"
                  {...registerEdit("name", { required: true })}
                />
                <input
                  className={scss.input}
                  placeholder="Age"
                  type="number"
                  {...registerEdit("age", { required: true })}
                />
                <input
                  className={scss.input}
                  placeholder="File"
                  type="file"
                  {...registerEdit("file", { required: true })}
                />
                <button className={scss.button} type="submit">
                  Save
                </button>
              </form>
            </div>
          ) : (
            <>
              <br />
              <div className={scss.todoCard}>
                <Image
                  className={scss.image}
                  src={el.file}
                  width={500}
                  height={300}
                  alt="img"
                />
                <h2 className={scss.name}>{el.name}</h2>
                <div className={scss.buttons}>
                  <button
                    className={scss.button}
                    onClick={() => deleteHandler(el._id!)}
                  >
                    Delete
                  </button>
                  <button
                    className={scss.buttonEdit}
                    onClick={() => {
                      setEditId(el._id!);
                      setValue("name", el.name);
                      setValue("age", el.age);
                      setValue("file", el.file);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default TodoList;
