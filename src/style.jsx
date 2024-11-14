import styled from 'styled-components'

export const Row = styled.div`
    display: flex;

    flex-direction: row;
    justify-content: space-between;

    @media (max-width: 768px) {
        flex-direction: column;
        justify-content: center;
    }

    gap: 1rem;
    margin-bottom: 1rem;
    width: 100%;
`
