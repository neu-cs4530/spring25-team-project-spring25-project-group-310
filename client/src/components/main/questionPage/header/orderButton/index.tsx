import React from 'react';
import './index.css';
import { OrderType } from '../../../../../types/types';
import { orderTypeDisplayName } from '../../../../../types/constants';

/**
 * Interface representing the props for the OrderButton component.
 *
 * orderType - The type of ordering to apply
 * setQuestionOrder - A function that sets the order of questions based on the type
 */
interface OrderButtonProps {
  orderType: OrderType;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * OrderButton component renders a sleek button that changes question ordering
 *
 * @param orderType - The ordering type and the value passed to setQuestionOrder function
 * @param setQuestionOrder - Callback function to set the order of questions
 */
const OrderButton = ({ orderType, setQuestionOrder }: OrderButtonProps) => (
  <button
    className='order-btn'
    onClick={() => {
      setQuestionOrder(orderType);
    }}>
    {orderTypeDisplayName[orderType]}
  </button>
);

export default OrderButton;
