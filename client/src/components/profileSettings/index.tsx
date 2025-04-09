import React from 'react';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,

    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
  } = useProfileSettings();

  if (loading) {
    return (
      <div className='page-container'>
        <div className='profile-card'>
          <div className='loading-spinner'></div>
          <p className='loading-text'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='page-container'>
      <div className='profile-card'>
        <div className='profile-header'>
          <div className='profile-avatar'>{userData?.username.charAt(0).toUpperCase()}</div>
          <h1 className='profile-title'>Profile Settings</h1>
        </div>

        {errorMessage && (
          <div className='error-message-container'>
            <svg
              className='error-icon'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10'></circle>
              <line x1='12' y1='8' x2='12' y2='12'></line>
              <line x1='12' y1='16' x2='12.01' y2='16'></line>
            </svg>
            <p className='error-message'>{errorMessage}</p>
          </div>
        )}

        {userData ? (
          <>
            <div className='settings-section'>
              <h2 className='section-title'>General Information</h2>

              <div className='setting-item'>
                <label className='setting-label'>Username</label>
                <div className='setting-value'>{userData.username}</div>
              </div>

              <div className='setting-item'>
                <label className='setting-label'>Date Joined</label>
                <div className='setting-value'>
                  {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className='setting-item'>
                <label className='setting-label'>Biography</label>
                {!editBioMode ? (
                  <div className='setting-value-with-action'>
                    <div className='setting-value'>{userData.biography || 'No biography yet.'}</div>
                    {canEditProfile && (
                      <button
                        className='edit-button'
                        onClick={() => {
                          setEditBioMode(true);
                          setNewBio(userData.biography || '');
                        }}>
                        Edit
                      </button>
                    )}
                  </div>
                ) : (
                  <div className='setting-editor'>
                    <textarea
                      className='bio-textarea'
                      value={newBio}
                      onChange={e => setNewBio(e.target.value)}
                      placeholder='Write something about yourself...'
                      rows={4}
                    />
                    <div className='editor-actions'>
                      <button className='save-button' onClick={handleUpdateBiography}>
                        Save
                      </button>
                      <button className='cancel-button' onClick={() => setEditBioMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {canEditProfile && (
              <>
                <div className='settings-section'>
                  <h2 className='section-title'>Security</h2>

                  <div className='setting-item'>
                    <label className='setting-label'>Password</label>
                    <div className='password-fields'>
                      <div className='form-group'>
                        <input
                          className='password-input'
                          type={showPassword ? 'text' : 'password'}
                          placeholder='New Password'
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className='form-group'>
                        <input
                          className='password-input'
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Confirm New Password'
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                        />
                      </div>

                      <div className='password-actions'>
                        <button className='reset-button' onClick={togglePasswordVisibility}>
                          {showPassword ? 'Hide' : 'Show'} Password
                        </button>
                        <button className='reset-button' onClick={handleResetPassword}>
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='settings-section danger-zone'>
                  <h2 className='section-title danger-title'>Danger Zone</h2>
                  <p className='danger-description'>
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className='delete-button' onClick={handleDeleteUser}>
                    Delete Account
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className='not-found'>
            <svg
              className='not-found-icon'
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10'></circle>
              <line x1='12' y1='8' x2='12' y2='12'></line>
              <line x1='12' y1='16' x2='12.01' y2='16'></line>
            </svg>
            <h2>User Not Found</h2>
            <p>No user data found. Make sure the username parameter is correct.</p>
          </div>
        )}

        {/* Confirmation Modal for Delete */}
        {showConfirmation && (
          <div className='modal-overlay' onClick={() => setShowConfirmation(false)}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
              <div className='modal-header'>
                <h2>Delete Account</h2>
              </div>
              <div className='modal-body'>
                <div className='modal-warning'>
                  <svg
                    className='warning-icon'
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ff4747'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
                    <line x1='12' y1='9' x2='12' y2='13'></line>
                    <line x1='12' y1='17' x2='12.01' y2='17'></line>
                  </svg>
                </div>
                <p>
                  Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                  action cannot be undone.
                </p>
                <p className='modal-disclaimer'>
                  All your posts, comments, and activities will be permanently removed.
                </p>
              </div>
              <div className='modal-actions'>
                <button className='cancel-button' onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
                <button className='delete-button' onClick={() => pendingAction && pendingAction()}>
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
