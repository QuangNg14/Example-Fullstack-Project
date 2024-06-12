"use client";
import { Radio, Form, Input, Button, Table, message } from "antd";
import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import NaturalLanguageInput from "@/components/naturalLanguageInput/NaturalLanguageInput";

export default function Home() {
  const BASE_URL = "<<CHANGE THIS TO THE URL OF YOUR SERVER>>";

  const [items, setItems] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [action, setAction] = useState("getAll");
  const handleActionChange = (e) => {
    setAction(e.target.value);
  };

  const getAll = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  useEffect(() => {
    getAll();
  }, [refresh]);

  // Add a new item
  const add = async (params) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      console.log(data);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // Remove an item by ID
  const remove = async (params) => {
    console.log(params);
    try {
      const response = await fetch(`http://127.0.0.1:5000/items/${params.id}`, {
        method: "DELETE",
      });
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Update an item by ID
  const update = async (params) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/items/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: params.newName,
          category: params.newCategory,
        }),
      });
      const data = await response.json();
      console.log(data);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  // Get items by category
  const getByCat = async (params) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/items/category/${params.category}`
      );
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items by category:", error);
    }
  };

  const addItemFromNaturalLanguage = async (input) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/parse_item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const parsedItem = data.parsed_item;

      console.log(parsedItem);

      const [namePart, categoryPart] = parsedItem
        .split(", ")
        .map((str) => str.split(": ")[1]);

      const newItem = { name: namePart, category: categoryPart };
      setItems((prevItems) => [...prevItems, newItem]);
      await add(newItem);
      message.success("Item added successfully!");
    } catch (error) {
      console.error("Failed to add item from natural language:", error);
      message.error("Failed to add item from natural language");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
  ];

  return (
    <main className="App">
      <Header />
      <h1>Shopping List</h1>

      <div className="Body">
        <div className="Form">
          <Radio.Group value={action} onChange={handleActionChange}>
            <Radio.Button value="getAll">Get All</Radio.Button>
            <Radio.Button value="add">Add</Radio.Button>
            <Radio.Button value="delete">Delete</Radio.Button>
            <Radio.Button value="update">Update</Radio.Button>
            <Radio.Button value="getByCat">Get By Category</Radio.Button>
            <Radio.Button value="addItemGPT">Add items using GPT</Radio.Button>
          </Radio.Group>

          {action === "getAll" && (
            <div className="FormBody">
              <Form
                onFinish={getAll}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 5 }}
              >
                <Button type="primary" htmlType="submit">
                  Get All Items
                </Button>
              </Form>
            </div>
          )}

          {action === "add" && (
            <div className="FormBody">
              <Form
                onFinish={add}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 5 }}
              >
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please input the name!" },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please input the category!" },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Add Item
                </Button>
              </Form>
            </div>
          )}

          {action === "delete" && (
            <div className="FormBody">
              <Form
                onFinish={remove}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 5 }}
              >
                <Form.Item
                  label="Existing Item ID"
                  name="id"
                  rules={[
                    {
                      required: true,
                      message: "Please input the existing item ID!",
                    },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Delete Item
                </Button>
              </Form>
            </div>
          )}

          {action === "update" && (
            <div className="FormBody">
              <Form
                onFinish={update}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 5 }}
              >
                <Form.Item
                  label="Existing Item ID"
                  name="id"
                  rules={[
                    {
                      required: true,
                      message: "Please input the existing item ID!",
                    },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Form.Item
                  label="New Name"
                  name="newName"
                  rules={[
                    { required: true, message: "Please input the new name!" },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Form.Item
                  label="New Category"
                  name="newCategory"
                  rules={[
                    {
                      required: true,
                      message: "Please input the new category!",
                    },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Item
                </Button>
              </Form>
            </div>
          )}

          {action === "getByCat" && (
            <div className="FormBody">
              <Form
                onFinish={getByCat}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 5 }}
              >
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please input the category!" },
                  ]}
                >
                  <Input style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Get Item by Category
                </Button>
              </Form>
            </div>
          )}

          {action === "addItemGPT" && (
            <NaturalLanguageInput onAddItem={addItemFromNaturalLanguage} />
          )}
        </div>

        <div className="Collection" style={{ width: "50%", marginTop: "20px" }}>
          <h2>All Items</h2>
          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            rowKey="id"
          />
        </div>
      </div>
    </main>
  );
}
