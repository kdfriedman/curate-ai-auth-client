import { Select, Box } from '@chakra-ui/react';

const AcctSelector = ({ acctList, onChangeHandler, labelText }) => {
  return (
    <>
      <Box margin="1rem 0 2rem;" className="acct-selector__container">
        <label
          style={{
            fontSize: '13px',
            fontWeight: '800',
            color: 'rgb(26, 32, 44)',
            margin: '1rem 0 0 2rem',
          }}
          htmlFor="ad account list"
        >
          {labelText}
        </label>
        <Select
          className="account-selector__select-list"
          onChange={onChangeHandler}
          placeholder="Please select an option"
          size="lg"
        >
          {acctList.map((acct) => {
            return (
              <option key={acct.id} value={acct.id}>
                {acct.name}
              </option>
            );
          })}
        </Select>
      </Box>
    </>
  );
};

export default AcctSelector;
