// Test for ResidenceDocuments component visaCode field
import { render } from '@testing-library/svelte';
import ResidenceDocuments from './ResidenceDocuments.svelte';
import { RegistrationState } from '../../../state/RegistrationState.svelte';
import { expect, test, describe, vi } from 'vitest';

describe('ResidenceDocuments', () => {
  test('displays visaCode field for short term visa', () => {
    const state = new RegistrationState();
    state.values.country = 'US'; // Non-EU, non-CZ
    state.values.residenceDocumentType = 'Krátkodobé vízum';
    
    const component = render(ResidenceDocuments, {
      props: { registrationState: state }
    });
    
    // Should display the visaCode field
    expect(component.getByLabelText(/Kód víza/i)).toBeInTheDocument();
  });

  test('displays visaCode field for long term visa', () => {
    const state = new RegistrationState();
    state.values.country = 'US'; // Non-EU, non-CZ
    state.values.residenceDocumentType = 'Dlouhodobé vízum';
    
    const component = render(ResidenceDocuments, {
      props: { registrationState: state }
    });
    
    // Should display the visaCode field
    expect(component.getByLabelText(/Kód víza/i)).toBeInTheDocument();
  });

  test('does not display visaCode field for other document types', () => {
    const state = new RegistrationState();
    state.values.country = 'US'; // Non-EU, non-CZ
    state.values.residenceDocumentType = 'Přechodný pobyt';
    
    const component = render(ResidenceDocuments, {
      props: { registrationState: state }
    });
    
    // Should not display the visaCode field
    expect(component.queryByLabelText(/Kód víza/i)).not.toBeInTheDocument();
  });

  test('binds visaCode value correctly', async () => {
    const state = new RegistrationState();
    state.values.country = 'US'; // Non-EU, non-CZ
    state.values.residenceDocumentType = 'Krátkodobé vízum';
    
    const component = render(ResidenceDocuments, {
      props: { registrationState: state }
    });
    
    const input = component.getByLabelText(/Kód víza/i) as HTMLInputElement;
    input.value = 'TEST123';
    await input.dispatchEvent(new Event('input', { bubbles: true }));
    
    expect(state.values.visaCode).toBe('TEST123');
  });
});