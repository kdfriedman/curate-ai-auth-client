import { Select, Box, useMediaQuery } from '@chakra-ui/react';

const AcctSelector = ({ acctList, onChangeHandler, labelText }) => {
  const isEqualToOrLessThan450 = useMediaQuery('(max-width: 450px)');
  const isEqualToOrLessThan800 = useMediaQuery('(max-width: 800px)');

  return (
    <>
      <Box margin={isEqualToOrLessThan800[0] ? '0 auto' : '1rem 0 2rem'} className="acct-selector__container">
        <label
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            fontSize: '13px',
            fontWeight: '800',
            color: 'rgb(26, 32, 44)',
            margin: `${isEqualToOrLessThan450[0] ? '1rem 1rem 0 1rem' : '1rem 1rem 0 2rem'}`,
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
