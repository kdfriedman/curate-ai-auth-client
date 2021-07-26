const AcctSelector = ({ acctList, onChangeHandler, labelText }) => {
  return (
    <>
      <label htmlFor="ad account list">{labelText}</label>
      <select onChange={onChangeHandler}>
        <option value="">--Please select an option--</option>
        {acctList.map((acct) => {
          return (
            <option key={acct.id} value={acct.id}>
              {acct.name}
            </option>
          );
        })}
      </select>
    </>
  );
};

export default AcctSelector;
