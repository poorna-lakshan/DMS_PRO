import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Card from "react-bootstrap/Card";
import {
  faEye,
  faClock,
  faShoppingCart,
  faExclamationCircle,
  faTimes,
  faSearch,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import baseURL from "../Auth/apiConfig";
import axios from "axios";

function RequestApproval() {
  const [unauthorizedProducts, setUnauthorizedProducts] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("");
  const [showAlert, setShowAlert] = useState({ type: "", message: "" });
  const [confirm, setConfirm] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPendingDeliveries();
    fetchUnauthorizedProducts();
    fetchDeliveryTypes();
  }, []);

  const fetchPendingDeliveries = async () => {
    try {
      const branchCode = localStorage.getItem("branchCode");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}BranchRequestItems/GetPendingDeliveryList/2/${branchCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingDeliveries(response.data);
    } catch (error) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      }
      setShowAlert({
        type: "error",
        message: error.response.data.toString(),
      });
      setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
      console.error("Error fetching pending deliveries:", error);
    }
  };

  const fetchDeliveryTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}BranchRequestItems/GetDeliveryTypeByDecodes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDeliveryTypes(response.data);
    } catch (error) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      }
      setShowAlert({
        type: "error",
        message: error.response.data.toString(),
      });
      setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
      console.error("Error fetching delivery types:", error);
    }
  };

  const fetchUnauthorizedProducts = async () => {
    try {
      const branchCode = localStorage.getItem("branchCode");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${baseURL}BranchRequestItems/GetUnAuthorizedCartProductDetails/2/${branchCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnauthorizedProducts(response.data);
    } catch (error) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      }
      setShowAlert({
        type: "error",
        message: error.response.data.toString(),
      });
      setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
      console.error("Error fetching unauthorized products:", error);
    }
  };

  const handleProductSelectionChange = (e, product) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedProducts([...selectedProducts, product]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== product));
    }
  };

  const handleDeliveryTypeChange = (e) => {
    setSelectedDeliveryType(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const branchCode = localStorage.getItem("branchCode");
      const token = localStorage.getItem("token");
      const user_id = localStorage.getItem("user_id");
      const ipAddress = localStorage.getItem("ipAddress");

      const payload = selectedProducts.map((product) => ({
        branchFlag: 2,
        branchCode: branchCode,
        seqNo: product.seqNo,
        productId: product.productId,
        productDescription: product.productDescription,
        txUnitOfMeasure: product.txUnitOfMeasure,
        quantity: product.quantity,
        deliveryType: selectedDeliveryType,
        createdBy: user_id,
        authorizedBy: user_id,
        createdWorkStation: ipAddress,
        modifiedBy: user_id,
        modifiedWorkStation: ipAddress,
      }));

      // Send POST request
      const response = await axios.post(
        `${baseURL}BranchRequestItems/PostRequestApproval`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowAlert({
        type: "success",
        message: "Post request sent successfully",
      });
      setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
      console.log("Post request sent successfully:", response.data);

      // Refetch data after successful submission

      setUnauthorizedProducts([]);
      fetchUnauthorizedProducts();
      fetchPendingDeliveries();
      fetchDeliveryTypes();

      handleClear();
      setSelectedProducts([]);
      setSelectedDeliveryType("");
    } catch (error) {
      setSelectedProducts([]);
      setUnauthorizedProducts([]);
      fetchUnauthorizedProducts();
      setSelectedDeliveryType("");
      console.error("Error sending post request:", error);
      if (error.response.status === 401) {
        window.location.href = "/login";
      }
      setShowAlert({
        type: "error",
        message: error.response
          ? error.response.data.toString()
          : "An error occurred",
      });
      setTimeout(() => setShowAlert({ type: "", message: "" }), 3000);
    }
  };

  const handleClear = () => {
    setSelectedProducts([]);
    setSelectedDeliveryType("");
  };

  const handleExit = () => {
    window.history.back();
  };

  const itemView = async (refNumber) => {
    console.log("nn", refNumber);
    setConfirm(true);

    try {
      const token = localStorage.getItem("token");
      const branchCode = localStorage.getItem("branchCode");
      const response = await axios.get(
        `${baseURL}BranchRequestItems/ViewPendingDeliveryDetails/${refNumber}/2/${branchCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/login";
      }
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  // Filter the data based on the search term
  const filteredData = data.filter((item) => {
    return (
      item.seqNo.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productDescription
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.uom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderQty
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.deliveredQty
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      {showAlert.type && (
        <div
          style={{
            position: "fixed",
            top: "25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor:
                showAlert.type === "success" ? "#d4edda" : "#f8d7da",
              color: showAlert.type === "success" ? "#155724" : "#721c24",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
          >
            <strong>
              {showAlert.type === "success" ? "Success:" : "Error:"}
            </strong>{" "}
            {showAlert.message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setShowAlert({ type: "", message: "" })}
              style={{
                height: "40px",
                marginLeft: "10px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            ></button>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-between mb-4">
        <Link to="/item-request">
          <Button color="secondary" variant="contained" className="mx-1">
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Add To Cart
          </Button>
        </Link>
      </div>
      <div className="d-flex">
        <Card className="flex-fill mr-2 ml-1" style={{ overflow: "auto" }}>
          <Card.Header as="h6">
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-danger me-2 mx-2"
            />
            Unauthorized Cart
          </Card.Header>
          <Card.Body>
            <TableContainer sx={{ maxHeight: "400px", overflow: "auto" }}>
              <Table stickyHeader aria-label="sticky table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3d3d3d",
                        color: "white",
                      }}
                      align="left"
                    >
                      Product ID
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3d3d3d",
                        color: "white",
                      }}
                      align="left"
                    >
                      Product Name
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3d3d3d",
                        color: "white",
                      }}
                      align="left"
                    >
                      UOM
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3d3d3d",
                        color: "white",
                      }}
                      align="left"
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        backgroundColor: "#3d3d3d",
                        color: "white",
                      }}
                      align="left"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unauthorizedProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">{product.productId}</TableCell>
                      <TableCell align="left" style={{ maxWidth: "180px" }}>
                        {product.productDescription}
                      </TableCell>
                      <TableCell align="left">
                        {product.txUnitOfMeasure}
                      </TableCell>
                      <TableCell align="left">{product.quantity}</TableCell>
                      <TableCell>
                        <Checkbox
                          name="group1"
                          onChange={(e) =>
                            handleProductSelectionChange(e, product)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <FormControl className="mt-4" sx={{ width: "306px" }}>
              <InputLabel id="delivery-type-label">
                Select delivery type
              </InputLabel>
              <Select
                size="small"
                labelId="delivery-type-label"
                value={selectedDeliveryType}
                onChange={handleDeliveryTypeChange}
                label="Select delivery type"
              >
                {/* <MenuItem value="">Select delivery type</MenuItem> */}
                {deliveryTypes.map((type, index) => (
                  <MenuItem key={index} value={type.deliveryTypeValue}>
                    {type.deliveryTypeText}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="mt-4">
              <Button
                color="primary"
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedProducts.length || !selectedDeliveryType}
              >
                Send Request
              </Button>
              <Button
                color="warning"
                variant="contained"
                onClick={handleClear}
                className=" mx-2"
              >
                <FontAwesomeIcon icon={faTimes} className="me-1 mx-2" />
                Clear
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={handleExit}
                className=""
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1 mx-2" />
                Back
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Pending Delivery Card */}
        <div>
          <Card className="flex-fill mx-3" style={{ maxWidth: "500px" }}>
            <Card.Header as="h6">
              <FontAwesomeIcon icon={faClock} className="me-2 mx-2" />
              Pending Delivery
            </Card.Header>
            <Card.Body>
              <TableContainer style={{ maxHeight: "550px", overflowY: "auto" }}>
                <Table stickyHeader aria-label="sticky table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                        }}
                        align="left"
                      >
                        Ref No
                      </TableCell>

                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                        }}
                        align="left"
                      >
                        Delivery
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                        }}
                        align="center"
                      >
                        View
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingDeliveries.map((delivery, index) => (
                      <TableRow key={index}>
                        <TableCell>{delivery.refNo}</TableCell>

                        <TableCell>{delivery.deliveyTypeText}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            className="mx-2"
                            onClick={() => itemView(delivery.refNo)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent>
          <Card>
            <Card.Body>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                </div>
              </div>
              <TableContainer sx={{ maxHeight: "300px", overflowY: "auto" }}>
                <Table stickyHeader aria-label="sticky table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        Seq No
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        Product ID
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        Description
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        UOM
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        Order Qty
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#3d3d3d",
                          color: "white",
                          cursor: "pointer",
                        }}
                        align="left"
                      >
                        Delivered Qty
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.seqNo}>
                        <TableCell align="left">{item.seqNo}</TableCell>
                        <TableCell align="left">{item.productId}</TableCell>
                        <TableCell align="left">
                          {item.productDescription}
                        </TableCell>
                        <TableCell align="left">{item.uom}</TableCell>
                        <TableCell align="center">{item.orderQty}</TableCell>
                        <TableCell align="center">
                          {item.deliveredQty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card.Body>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            color="warning"
            variant="contained"
            className="mx-3 mb-2"
            onClick={() => setConfirm(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RequestApproval;
