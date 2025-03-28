import { configureStore } from '@reduxjs/toolkit';
import predictionReducer, {
  clearSelectedPrediction,
  clearError,
} from '../predictionSlice';

describe('prediction slice', () => {
  const initialState = {
    carsDueSoon: [],
    selectedCarPrediction: null,
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(predictionReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearSelectedPrediction', () => {
    const actual = predictionReducer(
      {
        ...initialState,
        selectedCarPrediction: {
          car: {
            id: 1,
            make: 'Toyota',
            model: 'Corolla',
            year: 2015,
            license_plate: 'ABC-123',
            current_mileage: 50000,
          },
          services_due: [],
        },
      },
      clearSelectedPrediction()
    );
    expect(actual.selectedCarPrediction).toBeNull();
  });

  it('should handle clearError', () => {
    const actual = predictionReducer(
      {
        ...initialState,
        error: 'Failed to fetch',
      },
      clearError()
    );
    expect(actual.error).toBeNull();
  });

  // You would also add tests for the async thunks, but they require mocking API calls
});

// Example of how to test an async thunk (requires mocking the API)
/*
import { fetchCarsDueSoon } from '../predictionSlice';
import * as api from '../../../api/predictions';

jest.mock('../../../api/predictions');

describe('prediction async thunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch cars due soon', async () => {
    const mockData = [
      {
        car: {
          id: 1,
          make: 'Toyota',
          model: 'Corolla',
          year: 2015,
          license_plate: 'ABC-123',
          current_mileage: 50000,
        },
        customer: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        services_due: [
          {
            id: 1,
            service_type: 'Oil Change',
            next_service_mileage: 55000,
            next_service_date: '2023-12-31',
            predicted_next_service_date: null,
            mileage_to_go: 5000,
            days_to_go: 30,
          },
        ],
      },
    ];

    (api.getCarsDueSoon as jest.Mock).mockResolvedValue(mockData);

    const dispatch = jest.fn();
    const thunk = fetchCarsDueSoon();

    await thunk(dispatch, () => ({}), undefined);

    const { calls } = dispatch.mock;
    expect(calls[0][0].type).toBe('predictions/fetchDueSoon/pending');
    expect(calls[1][0].type).toBe('predictions/fetchDueSoon/fulfilled');
    expect(calls[1][0].payload).toEqual(mockData);
  });
});
*/ 